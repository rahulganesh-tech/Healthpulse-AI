from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Check, LabValue
from backend.schemas import DoctorCardResponse, LabValueSchema
from backend.services.card import generate_doctor_card_pdf

router = APIRouter(prefix="/api", tags=["cards"])

@router.get("/cards/{card_code}")
def get_doctor_card(card_code: str, request: Request, format: str = "json", db: Session = Depends(get_db)):
    check = db.query(Check).filter(Check.card_code == card_code.strip().upper()).first()
    if not check:
        raise HTTPException(status_code=404, detail=f"Doctor Card with code '{card_code}' not found")

    # Fetch associated lab values if check has owner_token
    labs = []
    if check.owner_token:
        lab_records = db.query(LabValue).filter(LabValue.owner_token == check.owner_token).all()
        labs = [LabValueSchema(
            test_code=l.test_code,
            value=l.value,
            unit=l.unit,
            ref_low=l.ref_low,
            ref_high=l.ref_high,
            flag=l.flag
        ) for l in lab_records]

    base_url = str(request.base_url).rstrip("/")
    # Build card data dictionary
    symptoms = check.structured_input.get("symptoms", []) if check.structured_input else []
    danger_answers = check.structured_input.get("danger_answers", {}) if check.structured_input else {}
    duration_days = check.structured_input.get("duration_days", 1) if check.structured_input else 1

    card_data = {
        "card_code": check.card_code,
        "created_at": check.created_at.isoformat() if check.created_at else "",
        "channel": check.channel,
        "language": check.language,
        "age_band": check.age_band,
        "sex": check.sex,
        "pregnant": check.pregnant,
        "child_under5": check.age_band == "0-4" or check.structured_input.get("child_under5", False),
        "conditions": check.conditions or [],
        "symptoms": symptoms,
        "duration_days": duration_days,
        "danger_answers": danger_answers,
        "report_values": [l.model_dump() for l in labs],
        "urgency": check.final_level,
        "urgency_reason": check.explanation or "Clinical rule or model determination",
        "rules_version": check.rules_version,
        "model_version": check.model_version,
        "qr_url": f"{base_url}/card/{check.card_code}",
        "pdf_url": f"{base_url}/api/cards/{check.card_code}?format=pdf"
    }

    if format.lower() == "pdf":
        pdf_bytes = generate_doctor_card_pdf(card_data, card_data["qr_url"])
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Doctor_Card_{check.card_code}.pdf"}
        )

    return DoctorCardResponse(**card_data)
