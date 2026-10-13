import re
from typing import Dict, Any, List, Tuple
from backend.config import settings

FORBIDDEN_DIAGNOSIS_PHRASES = [
    r"\byou have\b",
    r"\byou suffer from\b",
    r"\bdiagnosed with\b",
    r"\byour diagnosis is\b",
    r"\bdiagnosis:\b",
    r"\bpatient has\b"
]

FORBIDDEN_DRUG_NAMES = [
    r"\bparacetamol\b", r"\bdolo\b", r"\bibuprofen\b", r"\baspirin\b",
    r"\bamoxicillin\b", r"\bazithromycin\b", r"\bciprofloxacin\b",
    r"\bmetformin\b", r"\binsulin\b", r"\bamlodipine\b", r"\batene\b",
    r"\bcefixime\b", r"\bomeprazole\b", r"\bpantoprazole\b"
]

DOSE_PATTERN = r"\b\d+\s*(?:mg|ml|mcg|tablets?|capsules?|drops?)\b"

TEMPLATES = {
    "EMERGENCY": {
        "en": {
            "summary": "Our clinical safety engine detected critical danger signs requiring emergency medical attention right away.",
            "why": "Severe red-flag symptoms such as sudden chest pressure, respiratory failure, neurological signs, or heavy bleeding must be evaluated in a hospital without delay.",
            "next_step": "Call 108 immediately or go to the nearest emergency hospital. Do not wait."
        },
        "ta": {
            "summary": "உடனடி அவசர மருத்துவ சிகிச்சை தேவைப்படும் அபாய அறிகுறிகள் கண்டறியப்பட்டுள்ளன.",
            "why": "திடீர் நெஞ்சு வலி, மூச்சுத்திணறல், பக்கவாத அறிகுறிகள் அல்லது தீவிர ரத்தப்போக்கு உயிருக்கு ஆபத்தானது; உடனடியாக மருத்துவமனை சிகிச்சை தேவை.",
            "next_step": "உடனடியாக 108 அழைக்கவும் அல்லது அருகிலுள்ள அவசர சிகிச்சை மருத்துவமனைக்குச் செல்லவும். தாமதிக்க வேண்டாம்."
        }
    },
    "URGENT": {
        "en": {
            "summary": "Your symptoms indicate an acute illness that requires a medical examination today.",
            "why": "High persistent fever, dehydration signs, or significant pain need clinical assessment to start appropriate care and prevent complications.",
            "next_step": "Visit your nearest Primary Health Centre (PHC) or Community Health Centre (CHC) today."
        },
        "ta": {
            "summary": "உங்கள் அறிகுறிகள் இன்றே மருத்துவ பரிசோதனை செய்ய வேண்டிய நிலையைக் காட்டுகின்றன.",
            "why": "நீடிக்கும் அதிக காய்ச்சல், நீரிழப்பு அல்லது தீவிர அசௌகரியத்திற்கு ஆரம்ப சுகாதார நிலையத்தில் இன்றே சிகிச்சை பெற வேண்டும்.",
            "next_step": "இன்றே உங்கள் அருகிலுள்ள ஆரம்ப சுகாதார நிலையம் (PHC) செல்லவும்."
        }
    },
    "PHC_VISIT": {
        "en": {
            "summary": "Your symptoms are moderate and should be evaluated by a healthcare provider within 24 to 48 hours.",
            "why": "Common viral illnesses or subacute symptoms benefit from medical assessment, routine blood tests, and guided rest.",
            "next_step": "Visit your nearest Primary Health Centre or Ayushman Arogya Mandir within 1–2 days. You can also consult via eSanjeevani."
        },
        "ta": {
            "summary": "உங்கள் அறிகுறிகள் மிதமானவை; அடுத்த 24 முதல் 48 மணி நேரத்திற்குள் மருத்துவரிடம் காண்பிக்கவும்.",
            "why": "சாதாரண வைரஸ் காய்ச்சல் அல்லது உடல் வலிக்கு ஆரம்ப சுகாதார நிலையத்தில் பரிசோதனை செய்து கொள்வது நலம்.",
            "next_step": "அடுத்த 1-2 நாட்களில் ஆரம்ப சுகாதார நிலையம் அல்லது ஆயுஷ்மான் ஆரோக்கிய மந்திர் செல்லவும். eSanjeevani மூலமும் ஆலோசனை பெறலாம்."
        }
    },
    "SELF_CARE": {
        "en": {
            "summary": "Your symptoms appear mild and can generally be safely supported with home care, adequate rest, and hydration.",
            "why": "Mild seasonal symptoms usually improve on their own with proper fluid intake and rest.",
            "next_step": "Rest well and drink plenty of clean fluids. If symptoms worsen or new danger signs develop, visit your PHC."
        },
        "ta": {
            "summary": "உங்கள் அறிகுறிகள் லேசானவை; போதுமான ஓய்வு மற்றும் நீர்ச்சத்து எடுத்து வீட்டில் கவனிக்கலாம்.",
            "why": "லேசான சளி அல்லது சோர்வு நல்ல ஓய்வு மற்றும் திரவ உணவுகளால் குணமாகும்.",
            "next_step": "நன்கு ஓய்வெடுக்கவும், காய்ச்சிய நீர் அருந்தவும். உடல்நிலை மோசமடைந்தால் ஆரம்ப சுகாதார நிலையம் செல்லவும்."
        }
    },
    "CRISIS": {
        "en": {
            "summary": "We hear your distress and want you to know that compassionate, confidential support is available right now.",
            "why": "Emotional pain and overwhelming thoughts can happen to anyone, and trained counsellors are ready to listen and help you through this moment.",
            "next_step": "Call Tele-MANAS at 14416 (24/7 free toll-free support) or 108 right away. You are not alone."
        },
        "ta": {
            "summary": "உங்கள் மனவேதனையை நாங்கள் உணர்கிறோம்; அன்பான, பாதுகாப்பான இலவச உதவி உடனடியாக உள்ளது.",
            "why": "மன அழுத்தம் எவருக்கும் வரலாம்; உங்களுக்கு உதவ பயிற்சி பெற்ற ஆலோசகர்கள் தயாராக உள்ளனர்.",
            "next_step": "இலவச மனநல உதவி எண் Tele-MANAS 14416 அல்லது 108 உடனே அழைக்கவும். நீங்கள் தனியாக இல்லை."
        }
    }
}

def safety_post_filter(text: str) -> bool:
    """
    Returns True if text passes medical safety filters.
    Returns False if it contains diagnosis declarations, drug names, or dose patterns.
    """
    for pat in FORBIDDEN_DIAGNOSIS_PHRASES:
        if re.search(pat, text, re.IGNORECASE):
            return False
    for pat in FORBIDDEN_DRUG_NAMES:
        if re.search(pat, text, re.IGNORECASE):
            return False
    if re.search(DOSE_PATTERN, text, re.IGNORECASE):
        return False
    return True

def generate_safe_explanation(urgency: str, reasons: List[str], language: str = "ta") -> Dict[str, Any]:
    """
    Generates a patient-friendly 6th-standard reading level explanation.
    Guaranteed deterministic and guardrail compliant.
    """
    lvl = urgency if urgency in TEMPLATES else "PHC_VISIT"
    tmpl_en = TEMPLATES[lvl]["en"]
    tmpl_ta = TEMPLATES[lvl]["ta"]

    summary_en = tmpl_en["summary"]
    summary_ta = tmpl_ta["summary"]
    why_en = tmpl_en["why"]
    why_ta = tmpl_ta["why"]
    next_en = tmpl_en["next_step"]
    next_ta = tmpl_ta["next_step"]

    # Incorporate top reasons if available
    if reasons:
        factor_str = ", ".join(reasons[:2])
        why_en += f" Primary contributing factors noted: {factor_str}."

    # Verify guardrails
    if not safety_post_filter(why_en):
        why_en = tmpl_en["why"]

    questions = [
        "What signs should I watch for that mean I should seek emergency care immediately?",
        "Are there specific fluids or foods I should take or avoid while recovering?",
        "When should I come back for a review if my symptoms do not improve?"
    ]

    return {
        "summary": summary_ta if language == "ta" else summary_en,
        "summary_en": summary_en,
        "summary_ta": summary_ta,
        "why": why_ta if language == "ta" else why_en,
        "why_en": why_en,
        "why_ta": why_ta,
        "next_step": next_ta if language == "ta" else next_en,
        "next_step_en": next_en,
        "next_step_ta": next_ta,
        "questions": questions,
        "mode": "template_guardrailed"
    }
