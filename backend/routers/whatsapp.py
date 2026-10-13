import hashlib
from fastapi import APIRouter, Form, Response
from typing import Optional

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

# In-memory session state machine (keyed by salted phone hash)
SESSIONS = {}

def hash_phone(phone: str) -> str:
    salt = "healthpulse-salt-2026"
    return hashlib.sha256(f"{salt}:{phone}".encode("utf-8")).hexdigest()

@router.post("/webhook")
def whatsapp_webhook(
    From: Optional[str] = Form(""),
    Body: Optional[str] = Form("")
):
    """
    Twilio Sandbox WhatsApp Webhook:
    Conversational state machine with emergency priority:
    1. Language selection
    2. Group selection (adult / child / pregnant)
    3. Symptoms description
    4. Danger signs check
    5. Result: EMERGENCY replies with 'Call 108 now.' first and alone!
    """
    body_text = Body.strip() if Body else ""
    user_hash = hash_phone(From)

    session = SESSIONS.get(user_hash, {"state": "START", "lang": "ta", "group": "adult", "symptoms": []})

    twiml_resp = ""

    if session["state"] == "START" or body_text.lower() in ["hi", "hello", "vanakkam", "start"]:
        session["state"] = "SELECT_LANG"
        twiml_resp = (
            "வணக்கம் / Welcome to HealthPulse AI.\n\n"
            "தயவுசெய்து உங்கள் மொழியைத் தேர்ந்தெடுக்கவும் / Select language:\n"
            "1. தமிழ் (Tamil)\n"
            "2. English"
        )
    elif session["state"] == "SELECT_LANG":
        if "2" in body_text or "en" in body_text.lower():
            session["lang"] = "en"
            session["state"] = "SELECT_GROUP"
            twiml_resp = (
                "Who is this health check for?\n"
                "1. Adult (General)\n"
                "2. Child under 5\n"
                "3. Pregnant woman"
            )
        else:
            session["lang"] = "ta"
            session["state"] = "SELECT_GROUP"
            twiml_resp = (
                "இந்த பரிசோதனை யாருக்காக?\n"
                "1. பெரியவர் (Adult)\n"
                "2. 5 வயதுக்குட்பட்ட குழந்தை\n"
                "3. கர்ப்பிணி பெண்"
            )
    elif session["state"] == "SELECT_GROUP":
        if "2" in body_text:
            session["group"] = "child_under5"
        elif "3" in body_text:
            session["group"] = "pregnant"
        else:
            session["group"] = "adult"

        session["state"] = "GET_SYMPTOMS"
        twiml_resp = (
            "Please describe the symptoms (e.g. fever for 3 days, chest pain, body ache):"
            if session["lang"] == "en" else
            "உங்கள் அறிகுறிகளை விவரிக்கவும் (எ.கா: 3 நாளா காய்ச்சல், நெஞ்சு வலி, உடம்பு வலி):"
        )
    elif session["state"] == "GET_SYMPTOMS":
        session["symptoms"] = body_text
        session["state"] = "DANGER_CHECK"

        # Check for immediate life-threatening terms
        lowered = body_text.lower()
        if any(w in lowered for w in ["nenju vali", "chest pain", "breathless", "moochu", "fits", "bleeding"]):
            session["state"] = "START"
            twiml_resp = (
                "🚨 CALL 108 NOW.\n\n"
                "Critical red-flag symptoms detected. Do not wait. Emergency ambulance assistance is required immediately.\n\n"
                "Nearest Center: Nanguneri PHC / Tirunelveli Medical College Hospital.\n"
                "Doctor Card: https://healthpulse-ai.vercel.app/card/EMG108"
                if session["lang"] == "en" else
                "🚨 உடனடியாக 108 அழைக்கவும்.\n\n"
                "உயிருக்கு ஆபத்தான அவசர அறிகுறி கண்டறியப்பட்டுள்ளது. தாமதிக்க வேண்டாம். உடனே 108 அழைக்கவும்.\n\n"
                "அருகிலுள்ள மையம்: நாங்குநேரி ஆரம்ப சுகாதார நிலையம்.\n"
                "மருத்துவர் அட்டை: https://healthpulse-ai.vercel.app/card/EMG108"
            )
        else:
            twiml_resp = (
                "Danger check: Any sudden weakness, confusion, or unable to drink fluids?\nReply 1 for Yes, 2 for No."
                if session["lang"] == "en" else
                "அபாய சோதனை: திடீர் பலவீனம், மயக்கம் அல்லது தண்ணீர் குடிக்க முடியாத நிலை உள்ளதா?\nஆம் என்றால் 1, இல்லை என்றால் 2 என பதிலளிக்கவும்."
            )
    elif session["state"] == "DANGER_CHECK":
        session["state"] = "START"
        if "1" in body_text:
            twiml_resp = (
                "🚨 CALL 108 NOW.\n\n"
                "Danger sign reported. Please reach the nearest emergency hospital immediately."
                if session["lang"] == "en" else
                "🚨 உடனடியாக 108 அழைக்கவும்.\n\n"
                "அபாய அறிகுறி உள்ளது. உடனடியாக அருகிலுள்ள மருத்துவமனைக்குச் செல்லவும்."
            )
        else:
            twiml_resp = (
                "✅ Triage Result: PHC Visit Recommended within 24–48 hours.\n\n"
                "Nearest Facility: Nanguneri PHC (Ph: +91-4635-250102)\n"
                "Show this card to the doctor: https://healthpulse-ai.vercel.app/card/CHK789\n\n"
                "Disclaimer: Health information and navigation only. Not a diagnosis."
                if session["lang"] == "en" else
                "✅ பரிசோதனை முடிவு: அடுத்த 24-48 மணி நேரத்திற்குள் ஆரம்ப சுகாதார நிலையத்திற்கு செல்லவும்.\n\n"
                "அருகிலுள்ள மையம்: நாங்குநேரி PHC (Ph: +91-4635-250102)\n"
                "மருத்துவர் அட்டை: https://healthpulse-ai.vercel.app/card/CHK789\n\n"
                "குறிப்பு: இது நோயறிதல் அல்ல; மருத்துவ வழிகாட்டல் மட்டுமே."
            )

    SESSIONS[user_hash] = session

    xml_content = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{twiml_resp}</Message></Response>'
    return Response(content=xml_content, media_type="application/xml")
