import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend.models import AuditLog, Check, User
from backend.safety.engine import (
    evaluate_red_flags, run_hybrid_safety_engine, check_anti_minimisation
)
from backend.services.audit import verify_audit_chain
from backend.services.recommendations import get_zone_interventions
from backend.schemas import ZoneData

client = TestClient(app)

# 1. Safety Rules Tests
def test_rf_chest_01_positive_and_negative():
    # Positive case: Chest pain + Sweating + Age 58
    pos_record = {
        "symptoms": ["chest_pain", "sweating"],
        "age_band": "40-59",
        "danger_answers": {"sweating": True}
    }
    pos_hits = evaluate_red_flags(pos_record)
    assert any(h["id"] == "RF-CHEST-01" for h in pos_hits)
    assert any(h["level"] == "EMERGENCY" for h in pos_hits)

    # Negative case: Mild headache + normal age
    neg_record = {
        "symptoms": ["mild_headache"],
        "age_band": "18-39",
        "danger_answers": {}
    }
    neg_hits = evaluate_red_flags(neg_record)
    assert not any(h["id"] == "RF-CHEST-01" for h in neg_hits)

def test_rf_mind_15_crisis_override():
    crisis_record = {
        "symptoms": ["headache"],
        "danger_answers": {"self_harm": True}
    }
    res = run_hybrid_safety_engine(crisis_record)
    assert res["final_level"] == "CRISIS"
    assert "Tele-MANAS" in res.get("helpline", "")

# 2. Anti-Minimisation Guard Tests
def test_anti_minimisation_murugan():
    text_with_gas = "nenju vali, romba viyarvai, gas dhaan"
    cleaned, found = check_anti_minimisation(text_with_gas)
    assert "gas dhaan" in found
    assert "gas dhaan" not in cleaned

    # Murugan with gas dhaan
    rec1 = {
        "age_band": "40-59",
        "sex": "M",
        "symptoms": ["chest_pain", "sweating"],
        "danger_answers": {"sweating": True},
        "minimising_phrases": found
    }
    res1 = run_hybrid_safety_engine(rec1)

    # Murugan without gas dhaan
    rec2 = {
        "age_band": "40-59",
        "sex": "M",
        "symptoms": ["chest_pain", "sweating"],
        "danger_answers": {"sweating": True},
        "minimising_phrases": []
    }
    res2 = run_hybrid_safety_engine(rec2)

    assert res1["final_level"] == "EMERGENCY"
    assert res2["final_level"] == "EMERGENCY"
    assert res1["final_level"] == res2["final_level"]

# 3. LLM Cannot Change Urgency
def test_llm_cannot_alter_urgency():
    from backend.explain.generator import generate_safe_explanation
    # Even if someone asks for a mild explanation on an EMERGENCY level,
    # the generator preserves EMERGENCY next_step
    exp = generate_safe_explanation("EMERGENCY", ["chest pain"])
    assert "108" in exp["next_step_en"]
    assert "108" in exp["next_step_ta"]

# 4. 5 Demo Personas (Prompt 8 Verification)
def test_demo_personas():
    # 1. Murugan
    r_murugan = client.get("/api/cards/MUR58M")
    assert r_murugan.status_code == 200
    assert r_murugan.json()["urgency"] == "EMERGENCY"

    # 2. Selvi
    r_selvi = client.get("/api/cards/SEL24F")
    assert r_selvi.status_code == 200
    assert r_selvi.json()["urgency"] == "EMERGENCY"

    # 3. Kavya
    r_kavya = client.get("/api/cards/KAV03F")
    assert r_kavya.status_code == 200
    assert r_kavya.json()["urgency"] == "EMERGENCY"

    # 4. Karthik
    r_karthik = client.get("/api/cards/KAR19M")
    assert r_karthik.status_code == 200
    assert r_karthik.json()["urgency"] == "PHC_VISIT"

    # 5. Lakshmi
    r_lakshmi = client.get("/api/cards/LAK45F")
    assert r_lakshmi.status_code == 200
    assert r_lakshmi.json()["urgency"] == "PHC_VISIT"

# 5. Community Pulse Nanguneri Week 33 Alert
def test_community_pulse_nanguneri():
    login_res = client.post("/api/auth/login", json={"phone_or_email": "mo.nanguneri@healthpulse.demo", "password": "demo123"})
    token = login_res.json()["accessToken"]

    pulse_res = client.get("/api/pulse?phc_id=PHC-02&syndrome=FEVER", headers={"Authorization": f"Bearer {token}"})
    assert pulse_res.status_code == 200
    pdata = pulse_res.json()
    assert pdata["baselineMean"] == 19.8
    assert pdata["baselineSd"] == 3.5
    assert pdata["currentUcl"] == 24.1
    assert pdata["activeAlert"] is not None
    assert pdata["activeAlert"]["weekStart"] == "2026-W33"

# 6. District View Key-Name Bug Fix (Manur MMU + 3+ different interventions)
def test_district_view_key_name_bug_fixed():
    overview_res = client.get("/api/overview")
    assert overview_res.status_code == 200
    data = overview_res.json()
    
    # Check Manur has Mobile Medical Unit
    manur_zone = next(z for z in data["zones"] if z["name"] == "Manur Health Zone")
    assert any("Mobile Medical Unit" in i for i in manur_zone["interventions"])

    # Across 10 zones, at least 3 distinct interventions must appear
    all_interventions = set()
    for z in data["zones"]:
        for i in z["interventions"]:
            all_interventions.add(i)
    assert len(all_interventions) >= 3

# 7. Audit Chain Cryptographic Verification
def test_audit_chain_verification():
    db = SessionLocal()
    verify_res = verify_audit_chain(db)
    assert verify_res["intact"] is True
    assert verify_res["total_entries"] >= 5
    db.close()

# 8. Privacy Right to Erasure
def test_delete_me_privacy():
    # Create a temporary check with owner token
    token = "USR-TEMP-TEST"
    c_res = client.post("/api/checks", json={
        "channel": "web",
        "language": "en",
        "record": {
            "ageBand": "18-39",
            "sex": "M",
            "symptoms": ["headache"],
            "durationDays": 1
        }
    })
    assert c_res.status_code == 200

    del_res = client.delete(f"/api/me?owner_token={token}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"
