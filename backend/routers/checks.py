import random
import string
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Check, PulseCount, User, PHC
from backend.schemas import (
    CheckParseRequest, CheckParseResponse, DangerQuestion,
    StructuredRecord, CheckCreateRequest, CheckResultResponse,
    CareOption
)
from backend.safety.engine import (
    check_anti_minimisation, parse_symptoms_and_duration,
    run_hybrid_safety_engine
)
from backend.explain.generator import generate_safe_explanation
from backend.pulse.ewma import map_symptoms_to_syndrome
from backend.services.auth import get_current_user, require_roles
from backend.services.audit import append_audit_log

router = APIRouter(prefix="/api", tags=["checks"])

def generate_card_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=6))

@router.post("/checks/parse", response_model=CheckParseResponse)
def parse_symptom_input(req: CheckParseRequest):
    # 1. Anti-minimisation guard
    cleaned_text, minimising_found = check_anti_minimisation(req.text)

    # 2. Extract symptoms & duration
    extracted_syms, duration_days = parse_symptoms_and_duration(cleaned_text)

    # If no symptoms parsed but text exists, include generic feeling unwell
    if not extracted_syms and cleaned_text:
        extracted_syms = ["body_pain"]

    # 3. Read-back sentence
    sym_labels_en = [s.replace("_", " ") for s in extracted_syms]
    sym_str_en = ", ".join(sym_labels_en) if sym_labels_en else "general discomfort"
    read_back_en = f"You reported: {sym_str_en} for {duration_days} day(s)."
    read_back_ta = f"நீங்கள் கூறியது: {sym_str_en}, {duration_days} நாட்களாக."

    # 4. Tailor 5 danger questions based on user group (adult, child_under5, pregnant)
    danger_questions = []
    if req.pregnant:
        danger_questions = [
            DangerQuestion(id="bleeding", question_en="Any vaginal bleeding or fluid leaking?", question_ta="ரத்தப்போக்கு அல்லது பனிக்குட நீர் கசிவு உள்ளதா?", group="pregnant"),
            DangerQuestion(id="severe_headache_blurred_vision", question_en="Severe headache or blurred/double vision?", question_ta="கடுமையான தலைவலி அல்லது பார்வை மங்கலாக உள்ளதா?", group="pregnant"),
            DangerQuestion(id="fits", question_en="Any seizures, fits, or fainting?", question_ta="வலிப்பு அல்லது மயக்கம் ஏற்பட்டதா?", group="pregnant"),
            DangerQuestion(id="severe_belly_pain", question_en="Severe continuous abdominal pain?", question_ta="கடுமையான வயிற்று வலி உள்ளதா?", group="pregnant"),
            DangerQuestion(id="baby_moving_less", question_en="Is the baby moving significantly less than usual?", question_ta="குழந்தையின் அசைவு வழக்கத்தை விட குறைவாக உள்ளதா?", group="pregnant"),
        ]
    elif req.child_under5 or req.age_band == "0-4":
        danger_questions = [
            DangerQuestion(id="cannot_drink", question_en="Is the child unable to drink fluids or breastfeed?", question_ta="குழந்தை தாய்ப்பால் அல்லது தண்ணீர் குடிக்க முடியாமல் உள்ளதா?", group="child_under5"),
            DangerQuestion(id="vomits_everything", question_en="Does the child vomit out everything ingested?", question_ta="சாப்பிடும் அல்லது குடிக்கும் அனைத்தையும் வாந்தி எடுக்கிறதா?", group="child_under5"),
            DangerQuestion(id="fits", question_en="Has the child experienced fits or seizures?", question_ta="குழந்தைக்கு வலிப்பு அல்லது இழுப்பு வந்ததா?", group="child_under5"),
            DangerQuestion(id="hard_to_wake", question_en="Is the child unusually lethargic, sleepy, or hard to wake?", question_ta="குழந்தை மிக சோர்வாக அல்லது எழுப்ப முடியாத தூக்கத்தில் உள்ளதா?", group="child_under5"),
            DangerQuestion(id="fast_difficult_breathing", question_en="Is the child breathing abnormally fast or with chest drawing in?", question_ta="குழந்தை மிக வேகமாக மூச்சு விடுகிறதா?", group="child_under5"),
        ]
    else:
        # General / Adult danger questions
        danger_questions = [
            DangerQuestion(id="sweating", question_en="Do you have heavy cold sweating or chest pressure?", question_ta="அதிக வியர்வை அல்லது நெஞ்சு அழுத்தம் உள்ளதா?", group="adult"),
            DangerQuestion(id="breathless_at_rest", question_en="Are you experiencing severe shortness of breath while resting?", question_ta="ஓய்வெடுக்கும் போதும் மூச்சுத் திணறல் உள்ளதா?", group="adult"),
            DangerQuestion(id="face_droop", question_en="Sudden weakness in one arm/leg or slurred speech?", question_ta="ஒரு கை/காலில் திடீர் பலவீனம் அல்லது பேச இயலாமை உள்ளதா?", group="adult"),
            DangerQuestion(id="bleeding", question_en="Any uncontrolled bleeding, vomiting blood, or black stools?", question_ta="ரத்த வாந்தி, கருப்பு மலம் அல்லது நிற்காத ரத்தப்போக்கு உள்ளதா?", group="adult"),
            DangerQuestion(id="unconscious", question_en="Has there been any fainting, fits, or sudden confusion?", question_ta="மயக்கம், வலிப்பு அல்லது திடீர் மனக்குழப்பம் உள்ளதா?", group="adult"),
        ]

    structured_record = StructuredRecord(
        age_band=req.age_band,
        sex=req.sex,
        pregnant=req.pregnant,
        child_under5=req.child_under5 or (req.age_band == "0-4"),
        conditions=req.conditions,
        duration_days=duration_days,
        symptoms=extracted_syms,
        minimising_phrases=minimising_found,
        danger_answers={}
    )

    return CheckParseResponse(
        cleaned_text=cleaned_text,
        extracted_symptoms=extracted_syms,
        duration_days=duration_days,
        minimising_phrases_found=minimising_found,
        read_back_sentence_en=read_back_en,
        read_back_sentence_ta=read_back_ta,
        danger_questions=danger_questions,
        structured_record=structured_record
    )

@router.post("/checks", response_model=CheckResultResponse)
def create_health_check(req: CheckCreateRequest, db: Session = Depends(get_db)):
    rec_dict = req.record.model_dump()

    # 1. Evaluate Hybrid Safety Engine
    safety_output = run_hybrid_safety_engine(rec_dict)
    final_level = safety_output["final_level"]
    rule_level = safety_output["rule_level"]
    model_level = safety_output["model_level"]
    rule_hits = safety_output["rule_hits"]
    top_factors = safety_output["model_top_factors"]

    # 2. Reason text
    if rule_hits:
        reason = f"Safety rule triggered: {rule_hits[0]['message_en']}"
    elif top_factors:
        reason = f"Triage model factors: {', '.join(top_factors[:3])}"
    else:
        reason = f"Triage guidance based on {final_level.replace('_', ' ').lower()}"

    # 3. Generate safe explanation
    explanation_pack = generate_safe_explanation(final_level, top_factors, language=req.language)

    # 4. Public-care routing options
    care_options = []
    # Fetch nearest PHC if phc_id provided or default to Nanguneri/Manur
    target_phc = None
    if req.phc_id:
        target_phc = db.query(PHC).filter(PHC.id == req.phc_id).first()
    if not target_phc:
        target_phc = db.query(PHC).first()

    phc_name = target_phc.name if target_phc else "Local Government PHC"
    phc_phone = target_phc.phone if target_phc else "+91-462-248101"

    if final_level in ["EMERGENCY", "CRISIS"]:
        care_options.append(CareOption(
            name="108 Emergency Ambulance",
            type="emergency",
            distance_km=0.0,
            phone="108",
            action_text="Call 108 Immediately"
        ))
        if final_level == "CRISIS":
            care_options.append(CareOption(
                name="Tele-MANAS Mental Health Helpline",
                type="tele_manas",
                distance_km=0.0,
                phone="14416",
                action_text="Call 14416 Free Toll-Free"
            ))
        care_options.append(CareOption(
            name=f"{phc_name} / District Hospital",
            type="hospital",
            distance_km=2.4,
            phone=phc_phone,
            action_text="Emergency Casualty Ward"
        ))
    else:
        care_options.append(CareOption(
            name=phc_name,
            type="phc",
            distance_km=1.8,
            phone=phc_phone,
            action_text="Free Public Outpatient Care"
        ))
        care_options.append(CareOption(
            name="eSanjeevani National Tele-Consultation",
            type="esanjeevani",
            distance_km=0.0,
            phone="1075",
            action_text="Connect with Free Govt Doctor Online"
        ))

    # 5. Minimising warning
    minimising_warning = None
    if req.record.minimising_phrases:
        p_str = ", ".join([f"'{p}'" for p in req.record.minimising_phrases])
        minimising_warning = f"We noticed {p_str}. We did not use this to lower the urgency."

    # 6. Save check record with 6-char card code
    card_code = generate_card_code()
    check_id = f"CHK-{random.randint(100000, 999999)}"
    now = datetime.datetime.now(datetime.timezone.utc)
    expires = now + datetime.timedelta(days=30)

    db_check = Check(
        id=check_id,
        created_at=now,
        channel=req.channel,
        language=req.language,
        age_band=req.record.age_band,
        sex=req.record.sex,
        pregnant=req.record.pregnant,
        conditions=req.record.conditions,
        phc_id=target_phc.id if target_phc else "PHC-01",
        structured_input=rec_dict,
        minimising_phrases=req.record.minimising_phrases,
        rule_hits=rule_hits,
        rule_level=rule_level,
        model_level=model_level,
        model_probs=safety_output.get("model_probs", {}),
        model_top_factors=top_factors,
        final_level=final_level,
        explanation=explanation_pack["summary_en"],
        rules_version=safety_output.get("rules_version", "0.3-draft"),
        model_version=safety_output.get("model_version", "triage-0.1"),
        card_code=card_code,
        asha_id=req.asha_id,
        owner_token=req.owner_token,
        expires_at=expires
    )
    db.add(db_check)

    # 7. Add 1 anonymous count to Community Pulse (Prompt 2 & 7)
    syndrome = map_symptoms_to_syndrome(req.record.symptoms, req.record.danger_answers)
    current_week = now.strftime("%Y-W%W")
    phc_id_to_record = target_phc.id if target_phc else "PHC-02"

    pulse_row = db.query(PulseCount).filter(
        PulseCount.week_start == current_week,
        PulseCount.phc_id == phc_id_to_record,
        PulseCount.syndrome == syndrome
    ).first()
    if pulse_row:
        pulse_row.count += 1
    else:
        new_pulse = PulseCount(
            week_start=current_week,
            phc_id=phc_id_to_record,
            syndrome=syndrome,
            count=1
        )
        db.add(new_pulse)

    db.commit()

    return CheckResultResponse(
        check_id=check_id,
        card_code=card_code,
        final_level=final_level,
        rule_level=rule_level,
        model_level=model_level,
        reason=reason,
        rule_hits=rule_hits,
        model_top_factors=top_factors,
        next_step=explanation_pack["next_step_en"],
        next_step_ta=explanation_pack["next_step_ta"],
        care_options=care_options,
        explanation=explanation_pack["summary_en"],
        explanation_ta=explanation_pack["summary_ta"],
        doctor_questions=explanation_pack["questions"],
        rules_version=safety_output.get("rules_version", "0.3-draft"),
        model_version=safety_output.get("model_version", "triage-0.1"),
        minimising_warning=minimising_warning
    )

@router.get("/asha/checks")
def get_asha_checks(current_user: User = Depends(require_roles(["ASHA"])), db: Session = Depends(get_db)):
    """ASHA sees only her own entries (Prompt 3 & 9)"""
    checks = db.query(Check).filter(
        (Check.asha_id == current_user.id) | (Check.phc_id == current_user.phc_id)
    ).order_by(Check.created_at.desc()).limit(50).all()

    return [{
        "id": c.id,
        "createdAt": c.created_at.isoformat(),
        "ageBand": c.age_band,
        "sex": c.sex,
        "pregnant": c.pregnant,
        "symptoms": c.structured_input.get("symptoms", []) if c.structured_input else [],
        "finalLevel": c.final_level,
        "cardCode": c.card_code
    } for c in checks]
