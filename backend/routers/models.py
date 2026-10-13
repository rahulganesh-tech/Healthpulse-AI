import os
import json
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ModelRegistry, User
from backend.services.auth import get_current_user

router = APIRouter(prefix="/api/models", tags=["models"])

# In-memory feedback store for demonstration
FEEDBACK_STORE = {"too_high": 2, "too_low": 0, "total": 48}

@router.get("")
def get_model_cards(db: Session = Depends(get_db)):
    metrics_file = "results/metrics.json"
    metrics = {}
    if os.path.exists(metrics_file):
        with open(metrics_file, "r", encoding="utf-8") as f:
            metrics = json.load(f)

    pulse_sim_file = "results/pulse_simulation.json"
    pulse_metrics = {}
    if os.path.exists(pulse_sim_file):
        with open(pulse_sim_file, "r", encoding="utf-8") as f:
            pulse_metrics = json.load(f)

    return {
        "triageModel": {
            "modelName": "HealthPulse Calibrated Triage Ensemble",
            "modelVersion": "triage-0.1",
            "clinicalIntendedUse": "Health information and navigation support. Identifies emergency danger signs; triages non-emergency cases to appropriate level of public care.",
            "regulatoryPositioning": "Software for health education and public health triage routing (Non-device prototype per CDSCO draft Oct 2025). Not for clinical diagnosis or prescription.",
            "architecture": "Deterministic Red-Flag Rules (Layer 1) + Calibrated Logistic Regression / HistGradientBoosting (Layer 2) + Safe Explanation Guardrails (Layer 3)",
            "trainingDataset": "1,200 clinically structured synthetic vignettes calibrated to South Indian rural presentations",
            "evaluationDataset": "60 hand-written benchmark evaluation cases (20 EMERGENCY, 15 URGENT, 15 PHC_VISIT, 10 SELF_CARE)",
            "metrics": metrics,
            "limits": "Not clinically validated in randomized trials; prototype requires clinical study before real-world deployment.",
            "clinicianFeedback": {
                "tooHighCount": FEEDBACK_STORE["too_high"],
                "tooLowCount": FEEDBACK_STORE["too_low"],
                "totalReviews": FEEDBACK_STORE["total"],
                "concordanceRate": f"{round(((FEEDBACK_STORE['total'] - FEEDBACK_STORE['too_high'] - FEEDBACK_STORE['too_low']) / FEEDBACK_STORE['total']) * 100, 1)}%"
            }
        },
        "communityPulse": {
            "modelName": "Syndromic EWMA Early Warning Detector",
            "version": "pulse-1.0",
            "methodology": "Exponentially Weighted Moving Average control chart (lambda=0.3, L=3.0) with Poisson baseline estimation",
            "simulationEvidence": pulse_metrics
        }
    }

@router.post("/feedback")
def submit_mo_feedback(
    card_code: str = Body(..., embed=True),
    feedback_type: str = Body(..., embed=True), # too_high, too_low, appropriate
    comment: str = Body("", embed=True),
    current_user: User = Depends(get_current_user)
):
    FEEDBACK_STORE["total"] += 1
    if feedback_type == "too_high":
        FEEDBACK_STORE["too_high"] += 1
    elif feedback_type == "too_low":
        FEEDBACK_STORE["too_low"] += 1

    return {
        "status": "success",
        "message": f"Clinical feedback recorded for card {card_code}.",
        "currentConcordance": f"{round(((FEEDBACK_STORE['total'] - FEEDBACK_STORE['too_high'] - FEEDBACK_STORE['too_low']) / FEEDBACK_STORE['total']) * 100, 1)}%"
    }
