import math
import numpy as np
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.models import PulseCount, PulseAlert, PHC

SYNDROMES = ["FEVER", "FEVER_BLEED_RASH", "DIARRHOEA_VOMIT", "COUGH_BREATH", "HEAT"]

def map_symptoms_to_syndrome(symptoms: List[str], danger_answers: Dict[str, Any] = None) -> str:
    sym_set = set(symptoms)
    danger_set = set()
    if danger_answers:
        danger_set = {k for k, v in danger_answers.items() if v is True or v == "yes" or v == 1}

    # Heat illness
    if "sun_exposure" in sym_set or "heat_exposure" in sym_set or "hot_dry_skin" in danger_set:
        return "HEAT"

    # Dengue-like fever (bleed or rash)
    if "fever" in sym_set:
        dengue_signs = {"bleeding_gums_nose", "bleeding_gums", "red_spots", "rash_not_fading", "severe_belly_pain"}
        if any(d in danger_set for d in dengue_signs) or any(s in sym_set for s in ["red_spots", "itchy_rash"]):
            return "FEVER_BLEED_RASH"
        return "FEVER"

    # Diarrhoea / Vomiting
    if any(s in sym_set for s in ["loose_motions", "diarrhoea", "vomiting"]):
        return "DIARRHOEA_VOMIT"

    # Cough / Breath
    if any(s in sym_set for s in ["cough", "breathless", "severe_breathlessness"]):
        return "COUGH_BREATH"

    return "FEVER"

def calculate_ewma_series(counts: List[int], lam: float = 0.3, L: float = 3.0, baseline_weeks: int = 26) -> Dict[str, Any]:
    """
    Computes EWMA control chart over weekly counts series:
    - baseline mean mu and standard deviation sigma from first 26 weeks
    - z_t = lambda * x_t + (1 - lambda) * z_{t-1} with lambda = 0.3, z_0 = mu
    - UCL = mu + L * sigma * sqrt(lambda / (2 - lambda))
    """
    n = len(counts)
    if n == 0:
        return {"mu": 0.0, "sigma": 0.0, "ucl": 0.0, "ewma": [], "alerts": []}

    b_len = min(baseline_weeks, n)
    baseline_slice = counts[:b_len]
    mu = float(np.mean(baseline_slice))
    sigma = float(np.std(baseline_slice, ddof=1)) if b_len > 1 and np.std(baseline_slice, ddof=1) > 0 else 1.0

    var_factor = math.sqrt(lam / (2.0 - lam))
    ucl = mu + L * sigma * var_factor
    two_times_baseline = 2.0 * mu

    ewma_values = []
    z = mu
    alerts = []
    two_times_alerts = []

    for idx, x in enumerate(counts):
        week_num = idx + 1
        z = lam * x + (1.0 - lam) * z
        ewma_values.append(round(z, 1))

        if z > ucl:
            alerts.append(week_num)
        if x > two_times_baseline:
            two_times_alerts.append(week_num)

    return {
        "mu": round(mu, 1),
        "sigma": round(sigma, 1),
        "ucl": round(ucl, 1),
        "two_times_threshold": round(two_times_baseline, 1),
        "ewma": ewma_values,
        "first_ewma_alert_week": alerts[0] if alerts else None,
        "first_2x_alert_week": two_times_alerts[0] if two_times_alerts else None,
        "alert_weeks": alerts
    }

def evaluate_pulse_alerts_for_phc(db: Session, phc_id: str, syndrome: str = "FEVER"):
    records = db.query(PulseCount).filter(
        PulseCount.phc_id == phc_id,
        PulseCount.syndrome == syndrome
    ).order_by(PulseCount.week_start.asc()).all()

    if not records:
        return None

    counts = [r.count for r in records]
    stats = calculate_ewma_series(counts)

    # Check the latest week
    latest_record = records[-1]
    latest_ewma = stats["ewma"][-1]
    latest_ucl = stats["ucl"]

    if latest_ewma > latest_ucl:
        # Check if alert already exists
        existing = db.query(PulseAlert).filter(
            PulseAlert.phc_id == phc_id,
            PulseAlert.syndrome == syndrome,
            PulseAlert.week_start == latest_record.week_start
        ).first()

        if not existing:
            new_alert = PulseAlert(
                id=f"ALT-{phc_id}-{syndrome}-{latest_record.week_start}",
                phc_id=phc_id,
                syndrome=syndrome,
                week_start=latest_record.week_start,
                ewma=latest_ewma,
                ucl=latest_ucl,
                baseline_mean=stats["mu"],
                baseline_sd=stats["sigma"],
                status="Open",
                note="Automatic syndromic EWMA threshold breach alert."
            )
            db.add(new_alert)
            db.commit()
            return new_alert

    return None
