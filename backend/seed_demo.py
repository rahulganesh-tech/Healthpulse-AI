import csv
import json
import random
import datetime
import os
import hashlib
import string
from sqlalchemy.orm import Session
from backend.database import Base, engine, SessionLocal
from backend.models import (
    PHC, User, Check, Report, LabValue, PulseCount, PulseAlert,
    RulesVersion, ModelRegistry, Consent, AuditLog,
    RuralHealthZone, InterventionRequest
)
from backend.services.auth import hash_password
from backend.services.audit import append_audit_log, GENESIS_HASH, compute_entry_hash
from backend.pulse.ewma import calculate_ewma_series

def seed_database():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    # 1. 10 Tirunelveli Rural Health Zones
    # 2 Critical (Manur 78.5, Nanguneri 77.3), 2 High, 3 Moderate, 3 Low
    zones_data = [
        {"id": "ZONE-01", "name": "Manur Health Zone", "block": "Manur", "pop": 64000, "score": 78.5, "infra": 42.0, "staff": 38.0, "med": 30.0, "amb": 45.0, "mat": 18, "mal": 18.5, "phc": "PHC-01"},
        {"id": "ZONE-02", "name": "Nanguneri Health Zone", "block": "Nanguneri", "pop": 58000, "score": 77.3, "infra": 39.0, "staff": 35.0, "med": 42.0, "amb": 48.0, "mat": 16, "mal": 16.8, "phc": "PHC-02"},
        {"id": "ZONE-03", "name": "Radhapuram Health Zone", "block": "Radhapuram", "pop": 71000, "score": 68.2, "infra": 32.0, "staff": 28.0, "med": 52.0, "amb": 55.0, "mat": 12, "mal": 14.2, "phc": "PHC-03"},
        {"id": "ZONE-04", "name": "Cheranmahadevi Health Zone", "block": "Cheranmahadevi", "pop": 49000, "score": 64.0, "infra": 29.0, "staff": 25.0, "med": 58.0, "amb": 58.0, "mat": 10, "mal": 13.5, "phc": "PHC-04"},
        {"id": "ZONE-05", "name": "Ambasamudram Health Zone", "block": "Ambasamudram", "pop": 56000, "score": 54.5, "infra": 24.0, "staff": 20.0, "med": 70.0, "amb": 68.0, "mat": 8, "mal": 11.2, "phc": "PHC-05"},
        {"id": "ZONE-06", "name": "Kadayam Health Zone", "block": "Kadayam", "pop": 47000, "score": 51.0, "infra": 22.0, "staff": 18.0, "med": 72.0, "amb": 70.0, "mat": 7, "mal": 10.5, "phc": "PHC-06"},
        {"id": "ZONE-07", "name": "Kalakkad Health Zone", "block": "Kalakkad", "pop": 53000, "score": 48.2, "infra": 20.0, "staff": 16.0, "med": 74.0, "amb": 72.0, "mat": 6, "mal": 9.8, "phc": "PHC-07"},
        {"id": "ZONE-08", "name": "Valliyoor Health Zone", "block": "Valliyoor", "pop": 62000, "score": 41.5, "infra": 16.0, "staff": 12.0, "med": 82.0, "amb": 78.0, "mat": 4, "mal": 8.0, "phc": "PHC-08"},
        {"id": "ZONE-09", "name": "Palayamkottai Rural Zone", "block": "Palayamkottai", "pop": 82000, "score": 38.0, "infra": 14.0, "staff": 10.0, "med": 86.0, "amb": 82.0, "mat": 3, "mal": 7.2, "phc": "PHC-09"},
        {"id": "ZONE-10", "name": "Alangulam Health Zone", "block": "Alangulam", "pop": 55000, "score": 34.5, "infra": 12.0, "staff": 8.0, "med": 88.0, "amb": 85.0, "mat": 2, "mal": 6.5, "phc": "PHC-10"},
    ]

    for z in zones_data:
        db.add(RuralHealthZone(
            id=z["id"],
            name=z["name"],
            block=z["block"],
            population=z["pop"],
            vulnerability_score=z["score"],
            infrastructure_gap=z["infra"],
            staffing_shortage=z["staff"],
            medicine_stock_pct=z["med"],
            ambulance_coverage_pct=z["amb"],
            maternal_high_risk_count=z["mat"],
            child_malnutrition_pct=z["mal"],
            phc_id=z["phc"]
        ))

    # 2. 10 PHCs
    phc_csv = "data/phcs_tirunelveli.csv"
    with open(phc_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            db.add(PHC(
                id=r["id"],
                name=r["name"],
                block=r["block"],
                district=r["district"],
                lat=float(r["lat"]),
                lng=float(r["lng"]),
                phone=r["phone"],
                is_aam=r["is_aam"].lower() == "true",
                zone_id=r["zone_id"]
            ))

    # 3. Staff Users (password "demo123", OTP "482913")
    pwd_hash = hash_password("demo123")
    users = [
        {"id": "USR-ASHA", "email": "asha.manur@healthpulse.demo", "name": "Kavitha (ASHA Worker)", "role": "ASHA", "phc": "PHC-01"},
        {"id": "USR-MO-NG", "email": "mo.nanguneri@healthpulse.demo", "name": "Dr. S. Sundaram, MBBS", "role": "MO", "phc": "PHC-02"},
        {"id": "USR-MO-MN", "email": "mo.manur@healthpulse.demo", "name": "Dr. A. Meenakshi, MBBS", "role": "MO", "phc": "PHC-01"},
        {"id": "USR-DHO", "email": "dho@healthpulse.demo", "name": "Dr. V. Arumugam, MD (DHO)", "role": "DHO", "phc": None},
        {"id": "USR-CLIN", "email": "clin@healthpulse.demo", "name": "Dr. R. Rajendran, MD (Clinical Reviewer)", "role": "CLIN", "phc": None},
        {"id": "USR-ADMIN", "email": "admin@healthpulse.demo", "name": "System Administrator", "role": "ADMIN", "phc": None},
        {"id": "USR-AUDITOR", "email": "auditor@healthpulse.demo", "name": "Quality & Compliance Auditor", "role": "AUDITOR", "phc": None},
    ]

    for u in users:
        db.add(User(
            id=u["id"],
            phone_or_email=u["email"],
            name=u["name"],
            role=u["role"],
            phc_id=u["phc"],
            password_hash=pwd_hash,
            active=True
        ))

    # 4. Rules Version & Model Registry
    rules_path = "rules/red_flags.yaml"
    with open(rules_path, "r", encoding="utf-8") as f:
        yaml_content = f.read()
    rules_sha = hashlib.sha256(yaml_content.encode("utf-8")).hexdigest()

    db.add(RulesVersion(
        version="0.3-draft",
        yaml_text=yaml_content,
        sha256=rules_sha,
        proposed_by="Dr. R. Rajendran",
        approved_by="clin@healthpulse.demo",
        approved_at=datetime.datetime(2026, 10, 1, 9, 0, tzinfo=datetime.timezone.utc),
        active=True
    ))

    db.add(ModelRegistry(
        model_version="triage-0.1",
        trained_at=datetime.datetime(2026, 10, 5, 10, 0, tzinfo=datetime.timezone.utc),
        dataset="1200 synthetic vignettes",
        metrics={"emergency_under_triage": 0, "accuracy": 0.867},
        approved_by="Dr. R. Rajendran",
        active=True
    ))

    # 5. The Five Demo Personas (Prompt 8)
    now = datetime.datetime.now(datetime.timezone.utc)
    demo_personas = [
        # 1. Murugan: 58, M, Manur: "nenju vali, romba viyarvai", wife adds "gas dhaan" -> EMERGENCY by RF-CHEST-01
        {
            "id": "CHK-000101",
            "card_code": "MUR58M",
            "owner_token": "USR-MURUGAN",
            "age_band": "40-59",
            "sex": "M",
            "pregnant": False,
            "conditions": ["hypertension"],
            "phc_id": "PHC-01",
            "symptoms": ["chest_pain", "sweating"],
            "minimising": ["gas dhaan"],
            "danger": {"sweating": True},
            "rule_hits": [{"id": "RF-CHEST-01", "level": "EMERGENCY", "message_en": "Possible heart emergency (Chest pain accompanied by sweating, breathlessness, or age 40+). Call 108 immediately."}],
            "final_level": "EMERGENCY",
            "rule_level": "EMERGENCY",
            "model_level": "EMERGENCY",
            "top_factors": ["chest pain", "sweating", "age over 40"],
            "explanation": "Critical danger signs detected. Even though 'gas dhaan' was mentioned, chest pain with sweating at age 58 requires immediate emergency hospital care.",
            "duration": 1
        },
        # 2. Selvi: 24, F, 7 months pregnant: severe headache and blurred vision since morning -> EMERGENCY by RF-PREG-07
        {
            "id": "CHK-000102",
            "card_code": "SEL24F",
            "owner_token": "USR-SELVI",
            "age_band": "18-39",
            "sex": "F",
            "pregnant": True,
            "conditions": [],
            "phc_id": "PHC-01",
            "symptoms": ["severe_headache", "blurred_vision"],
            "minimising": [],
            "danger": {"severe_headache_blurred_vision": True},
            "rule_hits": [{"id": "RF-PREG-07", "level": "EMERGENCY", "message_en": "Maternal obstetric emergency (Severe headache with blurred vision indicates pre-eclampsia). Immediate hospital visit."}],
            "final_level": "EMERGENCY",
            "rule_level": "EMERGENCY",
            "model_level": "EMERGENCY",
            "top_factors": ["third trimester pregnancy", "severe headache", "blurred vision"],
            "explanation": "Pregnancy danger sign detected. Severe headache with blurred vision suggests acute high blood pressure / pre-eclampsia.",
            "duration": 1
        },
        # 3. Kavya: 3, F (via ASHA): loose motions, not drinking, very sleepy -> EMERGENCY by RF-CHILD-08
        {
            "id": "CHK-000103",
            "card_code": "KAV03F",
            "owner_token": "USR-KAVYA",
            "age_band": "0-4",
            "sex": "F",
            "pregnant": False,
            "conditions": [],
            "phc_id": "PHC-01",
            "symptoms": ["loose_motions", "vomiting"],
            "minimising": [],
            "danger": {"cannot_drink": True, "hard_to_wake": True},
            "rule_hits": [{"id": "RF-CHILD-08", "level": "EMERGENCY", "message_en": "Pediatric danger sign (Cannot drink/breastfeed and abnormally lethargic). Immediate emergency evaluation."}],
            "final_level": "EMERGENCY",
            "rule_level": "EMERGENCY",
            "model_level": "EMERGENCY",
            "top_factors": ["child under 5", "cannot drink fluids", "lethargic"],
            "explanation": "Severe childhood dehydration and danger signs. Immediate medical resuscitation required.",
            "duration": 1
        },
        # 4. Karthik: 19, M, Nanguneri: "3 naala kaichal, udambu vali, thalai vali"; all danger answers No; October (monsoon) -> PHC_VISIT from model
        {
            "id": "CHK-000104",
            "card_code": "KAR19M",
            "owner_token": "USR-KARTHIK",
            "age_band": "18-39",
            "sex": "M",
            "pregnant": False,
            "conditions": [],
            "phc_id": "PHC-02",
            "symptoms": ["fever", "body_pain", "headache"],
            "minimising": [],
            "danger": {},
            "rule_hits": [],
            "final_level": "PHC_VISIT",
            "rule_level": "SELF_CARE",
            "model_level": "PHC_VISIT",
            "top_factors": ["fever 3 days", "monsoon season", "body pain"],
            "explanation": "Symptoms suggest viral fever. Visit Nanguneri PHC within 24-48 hours for platelet and complete blood count testing.",
            "duration": 3
        },
        # 5. Lakshmi: 45, F, Manur: 3 CBC reports (Hb 11.2 -> 10.1 -> 8.9 g/dL) -> PHC_VISIT by LAB-HB-01 + LAB-HB-02 trend flag
        {
            "id": "CHK-000105",
            "card_code": "LAK45F",
            "owner_token": "USR-LAKSHMI",
            "age_band": "40-59",
            "sex": "F",
            "pregnant": False,
            "conditions": [],
            "phc_id": "PHC-01",
            "symptoms": ["tiredness", "body_pain"],
            "minimising": [],
            "danger": {},
            "rule_hits": [
                {"id": "LAB-HB-01", "level": "PHC_VISIT", "message_en": "Moderate anaemia (Hb 8.9 g/dL). Iron therapy recommended."},
                {"id": "LAB-HB-02", "level": "PHC_VISIT", "message_en": "Haemoglobin fell by 2.3 g/dL within 6 months. Trend investigation advised."}
            ],
            "final_level": "PHC_VISIT",
            "rule_level": "PHC_VISIT",
            "model_level": "PHC_VISIT",
            "top_factors": ["anaemia (Hb 8.9)", "progressive drop of 2.3 g/dL", "fatigue"],
            "explanation": "Haemoglobin is 8.9 g/dL and has dropped by 2.3 g/dL over 6 months. PHC clinical evaluation for nutritional anaemia or occult loss recommended.",
            "duration": 7
        }
    ]

    for p in demo_personas:
        rec_struct = {
            "age_band": p["age_band"],
            "sex": p["sex"],
            "pregnant": p["pregnant"],
            "conditions": p["conditions"],
            "duration_days": p["duration"],
            "symptoms": p["symptoms"],
            "danger_answers": p["danger"],
            "minimising_phrases": p["minimising"]
        }
        db.add(Check(
            id=p["id"],
            created_at=now,
            channel="web",
            language="ta",
            age_band=p["age_band"],
            sex=p["sex"],
            pregnant=p["pregnant"],
            conditions=p["conditions"],
            phc_id=p["phc_id"],
            structured_input=rec_struct,
            minimising_phrases=p["minimising"],
            rule_hits=p["rule_hits"],
            rule_level=p["rule_level"],
            model_level=p["model_level"],
            model_probs={},
            model_top_factors=p["top_factors"],
            final_level=p["final_level"],
            explanation=p["explanation"],
            rules_version="0.3-draft",
            model_version="triage-0.1",
            card_code=p["card_code"],
            owner_token=p["owner_token"],
            expires_at=now + datetime.timedelta(days=30)
        ))

    # 6. Lakshmi's 3 CBC Reports (Jan, Apr, Jul 2026)
    lakshmi_reports = [
        {"id": "REP-LAK-01", "date": "2026-01-15", "hb": 11.2, "plt": 260000, "wbc": 6400, "flag": "NORMAL"},
        {"id": "REP-LAK-02", "date": "2026-04-10", "hb": 10.1, "plt": 245000, "wbc": 6100, "flag": "LOW"},
        {"id": "REP-LAK-03", "date": "2026-07-20", "hb": 8.9,  "plt": 230000, "wbc": 5900, "flag": "LOW"},
    ]
    for rep in lakshmi_reports:
        db.add(Report(
            id=rep["id"],
            owner_token="USR-LAKSHMI",
            uploaded_at=datetime.datetime.strptime(rep["date"], "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc),
            report_date=rep["date"],
            source="pdf",
            confirmed=[
                {"test_code": "HB", "value": rep["hb"], "unit": "g/dL", "ref_low": 12.0, "ref_high": 16.0, "flag": rep["flag"]},
                {"test_code": "PLT", "value": rep["plt"], "unit": "/µL", "ref_low": 150000, "ref_high": 450000, "flag": "NORMAL"},
                {"test_code": "WBC", "value": rep["wbc"], "unit": "/µL", "ref_low": 4000, "ref_high": 11000, "flag": "NORMAL"}
            ]
        ))
        db.add(LabValue(
            id=f"LV-{rep['id']}-HB",
            report_id=rep["id"],
            owner_token="USR-LAKSHMI",
            test_code="HB",
            value=rep["hb"],
            unit="g/dL",
            ref_low=12.0,
            ref_high=16.0,
            flag=rep["flag"],
            recorded_at=datetime.datetime.strptime(rep["date"], "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
        ))
        db.add(LabValue(
            id=f"LV-{rep['id']}-PLT",
            report_id=rep["id"],
            owner_token="USR-LAKSHMI",
            test_code="PLT",
            value=rep["plt"],
            unit="/µL",
            ref_low=150000,
            ref_high=450000,
            flag="NORMAL",
            recorded_at=datetime.datetime.strptime(rep["date"], "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc)
        ))

    # 7. Additional synthetic lab sample reports (total 10)
    sample_reports_data = [
        {"id": "REP-SMP-01", "token": "USR-SMP-1", "date": "2026-08-01", "tests": [("HB", 13.5, "NORMAL"), ("PLT", 280000, "NORMAL"), ("FBS", 92, "NORMAL")]},
        {"id": "REP-SMP-02", "token": "USR-SMP-2", "date": "2026-08-05", "tests": [("PLT", 18000, "CRITICAL"), ("HB", 12.1, "NORMAL")]}, # Critical PLT
        {"id": "REP-SMP-03", "token": "USR-SMP-3", "date": "2026-08-10", "tests": [("CREAT", 3.4, "CRITICAL"), ("UREA", 68, "HIGH")]}, # High Creat
        {"id": "REP-SMP-04", "token": "USR-SMP-4", "date": "2026-08-15", "tests": [("HBA1C", 8.8, "HIGH"), ("FBS", 168, "HIGH")]},
        {"id": "REP-SMP-05", "token": "USR-SMP-5", "date": "2026-08-20", "tests": [("HB", 6.4, "CRITICAL")]}, # Critical Hb < 7
        {"id": "REP-SMP-06", "token": "USR-SMP-6", "date": "2026-08-25", "tests": [("WBC", 17500, "HIGH"), ("PLT", 320000, "NORMAL")]},
        {"id": "REP-SMP-07", "token": "USR-SMP-7", "date": "2026-08-28", "tests": [("FBS", 430, "CRITICAL")]},
    ]
    for smp in sample_reports_data:
        db.add(Report(
            id=smp["id"],
            owner_token=smp["token"],
            uploaded_at=datetime.datetime.strptime(smp["date"], "%Y-%m-%d").replace(tzinfo=datetime.timezone.utc),
            report_date=smp["date"],
            source="pdf",
            confirmed=[{"test_code": t[0], "value": t[1], "unit": "", "flag": t[2]} for t in smp["tests"]]
        ))

    # 8. Community Pulse Series (52 Weeks for 10 PHCs)
    # Nanguneri FEVER sequence (USE EXACTLY from Prompt 8):
    nanguneri_fever_52 = [
        24, 14, 18, 22, 19, 21, 25, 24, 24, 19, 15, 18, 20, 14, 16, 19, 23, 18, 22, 16, 24, 23, 19, 14, 22, 21,
        22, 21, 16, 25, 15, 28, 40, 52, 69, 82, 84, 106, 117, 113, 115, 137, 129, 118, 118, 113, 108, 128, 117, 122, 101, 114
    ]

    random.seed(42)
    all_phc_ids = [f"PHC-{i:02d}" for i in range(1, 11)]

    for w_idx in range(52):
        week_str = f"2026-W{w_idx+1:02d}"
        for phc_id in all_phc_ids:
            for syn in ["FEVER", "FEVER_BLEED_RASH", "DIARRHOEA_VOMIT", "COUGH_BREATH", "HEAT"]:
                if phc_id == "PHC-02" and syn == "FEVER":
                    c = nanguneri_fever_52[w_idx]
                else:
                    c = random.randint(8, 25)

                db.add(PulseCount(
                    week_start=week_str,
                    phc_id=phc_id,
                    syndrome=syn,
                    count=c
                ))

    # Compute expected Nanguneri alert in week 33:
    # baseline 1-26 stats: mu=19.8, sigma=3.5, UCL=24.1
    # Week 33 EWMA = 27.3 > UCL
    db.add(PulseAlert(
        id="ALT-PHC-02-FEVER-2026-W33",
        phc_id="PHC-02",
        syndrome="FEVER",
        week_start="2026-W33",
        ewma=27.3,
        ucl=24.1,
        baseline_mean=19.8,
        baseline_sd=3.5,
        status="Open",
        note="Syndromic EWMA threshold breached in week 33 (EWMA 27.3 > UCL 24.1). Outbreak signal detected 1 week before 2x-baseline."
    ))

    # 9. 200 Past Checks spread over last 8 weeks
    levels = ["SELF_CARE", "PHC_VISIT", "URGENT", "EMERGENCY"]
    level_weights = [0.35, 0.40, 0.18, 0.07]
    sym_choices = [["fever", "headache"], ["cough", "throat_irritation"], ["body_pain"], ["loose_motions"], ["dizziness_fainting"]]

    for i in range(200):
        days_ago = random.randint(1, 56)
        c_time = now - datetime.timedelta(days=days_ago)
        p_lvl = random.choices(levels, weights=level_weights)[0]
        p_phc = random.choice(all_phc_ids)
        c_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        c_syms = random.choice(sym_choices)

        db.add(Check(
            id=f"CHK-HST-{i+1:04d}",
            created_at=c_time,
            channel=random.choice(["web", "asha", "web"]),
            language=random.choice(["ta", "ta", "en"]),
            age_band=random.choice(["18-39", "40-59", "0-4", "60+"]),
            sex=random.choice(["M", "F"]),
            pregnant=random.choice([False, False, False, True]),
            conditions=[],
            phc_id=p_phc,
            structured_input={"symptoms": c_syms, "duration_days": random.randint(1, 5)},
            rule_hits=[],
            rule_level=p_lvl,
            model_level=p_lvl,
            final_level=p_lvl,
            explanation="Routine historical screening check.",
            card_code=c_code,
            asha_id="USR-ASHA" if p_phc == "PHC-01" and random.random() < 0.4 else None,
            expires_at=c_time + datetime.timedelta(days=30)
        ))

    # 10. Audit Log: Exactly 5 hash-chained entries (Prompt 8 & 16)
    # Entry 1: Demo data loaded
    # Entry 2: Rules v0.3-draft approved
    # Entry 3: Model triage-0.1 registered
    # Entry 4: Pulse alert raised: Nanguneri FEVER week 33
    # Entry 5: Doctor card viewed by MO Nanguneri
    audit_chain_definitions = [
        ("System Admin", "ADMIN", "Demo Data Loaded", "Filled database with synthetic demo data for 10 Tirunelveli PHCs, 5 personas, and 52-week surveillance."),
        ("Dr. R. Rajendran", "CLIN", "Rules v0.3-draft Approved", "Reviewed and approved red_flags.yaml (v0.3-draft, SHA-256)."),
        ("System Admin", "ADMIN", "Model triage-0.1 Registered", "Registered calibrated triage model triage-0.1 with 0% emergency under-triage on 60 vignettes."),
        ("Surveillance Engine", "SYSTEM", "Pulse Alert Raised: Nanguneri FEVER week 33", "EWMA statistic reached 27.3, crossing UCL of 24.1 for Nanguneri PHC FEVER syndrome."),
        ("Dr. S. Sundaram", "MO", "Doctor Card Viewed by MO Nanguneri", "Medical Officer scanned and reviewed Doctor Handoff Card KAR19M (Karthik) at Nanguneri PHC.")
    ]

    from backend.services.audit import format_canonical_ts
    prev_h = GENESIS_HASH
    for idx, (actor, role, act, det) in enumerate(audit_chain_definitions):
        entry_time = now - datetime.timedelta(hours=5 - idx)
        ts_str = format_canonical_ts(entry_time)
        curr_h = compute_entry_hash(ts_str, actor, role, act, det, prev_h)
        db.add(AuditLog(
            id=idx + 1,
            ts=entry_time,
            actor=actor,
            role=role,
            action=act,
            detail=det,
            prev_hash=prev_h,
            hash=curr_h
        ))
        prev_h = curr_h

    db.commit()
    db.close()
    print("HealthPulse AI synthetic demo database seeded successfully!")

if __name__ == "__main__":
    seed_database()
