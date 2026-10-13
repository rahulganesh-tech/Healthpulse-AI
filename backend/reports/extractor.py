import re
from typing import List, Dict, Any, Tuple
from backend.schemas import LabValueSchema

LAB_SYNONYMS = {
    "HB": ["haemoglobin", "hemoglobin", "hb", "hgb"],
    "PLT": ["platelet count", "platelets", "plt", "platelet", "thrombocytes"],
    "WBC": ["total leukocyte count", "total leucocyte count", "white blood cells", "wbc", "tlc"],
    "HBA1C": ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin"],
    "FBS": ["fasting blood sugar", "fasting glucose", "fbs"],
    "PPBS": ["post prandial blood sugar", "ppbs", "post prandial glucose"],
    "RBS": ["random blood sugar", "random glucose", "rbs"],
    "CREAT": ["serum creatinine", "creatinine", "creat"],
    "UREA": ["blood urea", "urea", "bun"],
    "TSH": ["thyroid stimulating hormone", "tsh", "serum tsh"],
    "CHOL": ["serum cholesterol", "total cholesterol", "cholesterol", "chol"]
}

DEFAULT_RANGES = {
    "HB": {"unit": "g/dL", "low": 12.0, "high": 16.0, "critical_low": 7.0, "critical_high": 20.0},
    "PLT": {"unit": "/µL", "low": 150000, "high": 450000, "critical_low": 20000, "critical_high": 1000000},
    "WBC": {"unit": "/µL", "low": 4000, "high": 11000, "critical_low": 2000, "critical_high": 30000},
    "HBA1C": {"unit": "%", "low": 4.0, "high": 5.6, "critical_low": 3.0, "critical_high": 10.0},
    "FBS": {"unit": "mg/dL", "low": 70, "high": 100, "critical_low": 54, "critical_high": 400},
    "PPBS": {"unit": "mg/dL", "low": 70, "high": 140, "critical_low": 54, "critical_high": 400},
    "RBS": {"unit": "mg/dL", "low": 70, "high": 140, "critical_low": 54, "critical_high": 400},
    "CREAT": {"unit": "mg/dL", "low": 0.6, "high": 1.2, "critical_low": 0.3, "critical_high": 3.0},
    "UREA": {"unit": "mg/dL", "low": 15, "high": 40, "critical_low": 5, "critical_high": 100},
    "TSH": {"unit": "µIU/mL", "low": 0.4, "high": 4.5, "critical_low": 0.1, "critical_high": 20.0},
    "CHOL": {"unit": "mg/dL", "low": 125, "high": 200, "critical_low": 50, "critical_high": 350}
}

MEANINGS = {
    "HB": {
        "LOW": {
            "en": "Haemoglobin carries oxygen in the blood. Yours is lower than usual, which can make you tired or breathless.",
            "ta": "ஹீமோகுளோபின் ரத்தத்தில் ஆக்சிஜனை எடுத்துச் செல்கிறது. உங்கள் அளவு குறைவாக உள்ளது, இது சோர்வு அல்லது மூச்சிரைப்பை ஏற்படுத்தலாம்."
        },
        "NORMAL": {
            "en": "Haemoglobin level is within normal healthy limits.",
            "ta": "ஹீமோகுளோபின் அளவு ஆரோக்கியமான அளவில் உள்ளது."
        },
        "HIGH": {
            "en": "Haemoglobin is higher than expected. Stay well hydrated and consult your doctor.",
            "ta": "ஹீமோகுளோபின் அளவு வழக்கத்தை விட அதிகமாக உள்ளது."
        }
    },
    "PLT": {
        "LOW": {
            "en": "Platelets help blood clot. Your level is reduced, which requires monitoring for dengue or fever.",
            "ta": "ரத்த தட்டணுக்கள் ரத்தம் உறைவதற்கு உதவும். உங்கள் அளவு குறைவாக உள்ளது, காய்ச்சல் இருந்தால் உடனே கண்காணிக்கவும்."
        },
        "NORMAL": {
            "en": "Platelet count is in the safe normal range.",
            "ta": "ரத்த தட்டணுக்கள் எண்ணிக்கை இயல்பான அளவில் உள்ளது."
        },
        "HIGH": {
            "en": "Platelets are elevated, which may indicate reactive inflammation.",
            "ta": "தட்டணுக்கள் அளவு அதிகமாக உள்ளது."
        }
    },
    "WBC": {
        "LOW": {
            "en": "White blood cells fight infection. Low counts can mean reduced immunity or viral infection.",
            "ta": "வெள்ளை ரத்த அணுக்கள் நோய்த்தொற்றை எதிர்க்கும். உங்கள் அளவு குறைவாக உள்ளது."
        },
        "NORMAL": {
            "en": "White blood cell count is normal.",
            "ta": "வெள்ளை ரத்த அணுக்கள் இயல்பான அளவில் உள்ளன."
        },
        "HIGH": {
            "en": "Elevated white blood cells suggest the body is actively fighting a bacterial infection or inflammation.",
            "ta": "வெள்ளை அணுக்கள் அதிகம் இருப்பது உடலில் தொற்று அல்லது அழற்சி இருப்பதைக் குறிக்கிறது."
        }
    },
    "HBA1C": {
        "HIGH": {
            "en": "HbA1c reflects 3-month average blood sugar. Elevated values indicate diabetes or suboptimal control.",
            "ta": "HbA1c கடந்த 3 மாத சர்க்கரை அளவைக் குறிக்கிறது. இது அதிகமாக இருந்தால் சர்க்கரை நோய் கட்டுப்பாட்டை மறுபரிசீலனை செய்ய வேண்டும்."
        },
        "NORMAL": {
            "en": "3-month glucose average is well within non-diabetic range.",
            "ta": "சர்க்கரை சராசரி அளவு சரியாக உள்ளது."
        }
    },
    "CREAT": {
        "HIGH": {
            "en": "Creatinine reflects kidney filter function. High levels require kidney evaluation and plenty of hydration.",
            "ta": "கிரியேட்டினின் சிறுநீரக செயல்பாட்டைக் காட்டுகிறது. இது அதிகமாக இருந்தால் மருத்துவ ஆலோசனை அவசியம்."
        },
        "NORMAL": {
            "en": "Kidney filtration biomarker is normal.",
            "ta": "சிறுநீரக செயல்பாடு சரியாக உள்ளது."
        }
    }
}

def classify_flag(test_code: str, val: float, ref_low: float, ref_high: float) -> str:
    defaults = DEFAULT_RANGES.get(test_code, {})
    crit_low = defaults.get("critical_low", ref_low * 0.5)
    crit_high = defaults.get("critical_high", ref_high * 1.8)

    if val <= crit_low or val >= crit_high:
        return "CRITICAL"
    elif val < ref_low:
        return "LOW"
    elif val > ref_high:
        return "HIGH"
    else:
        return "NORMAL"

def get_meaning(test_code: str, flag: str) -> Tuple[str, str]:
    if test_code in MEANINGS:
        if flag in MEANINGS[test_code]:
            return MEANINGS[test_code][flag]["en"], MEANINGS[test_code][flag]["ta"]
        elif "NORMAL" in MEANINGS[test_code]:
            return MEANINGS[test_code]["NORMAL"]["en"], MEANINGS[test_code]["NORMAL"]["ta"]
    return f"{test_code} is {flag.lower()}.", f"{test_code} அளவு {flag.lower()} ஆக உள்ளது."

def parse_report_text(raw_text: str) -> List[LabValueSchema]:
    """
    Parses unstructured lab text or OCR output using regex patterns and canonical synonyms.
    Handles units like 'lakhs' (e.g. 1.8 lakhs -> 180,000).
    """
    extracted_items = []
    lines = raw_text.splitlines()

    for code, synonyms in LAB_SYNONYMS.items():
        found = False
        defaults = DEFAULT_RANGES[code]
        unit = defaults["unit"]
        ref_low = defaults["low"]
        ref_high = defaults["high"]

        for syn in synonyms:
            # Pattern: Synonym followed by a number
            pattern = re.compile(rf"(?i)\b{re.escape(syn)}\b[^0-9\n]*([\d\.,]+)\s*([a-zA-Z/%µu\^]+)?", re.IGNORECASE)
            for line in lines:
                m = pattern.search(line)
                if m:
                    num_str = m.group(1).replace(",", "")
                    try:
                        val = float(num_str)
                    except ValueError:
                        continue

                    # Sanity check for Platelets written in lakhs
                    if code == "PLT" and val < 50.0:
                        val = round(val * 100000.0)

                    # Look for range on the same line if present (e.g. "12.0 - 16.0")
                    range_m = re.search(r"(\d+\.?\d*)\s*[-–to]\s*(\d+\.?\d*)", line)
                    if range_m:
                        try:
                            ref_low = float(range_m.group(1))
                            ref_high = float(range_m.group(2))
                        except ValueError:
                            pass

                    flag = classify_flag(code, val, ref_low, ref_high)
                    mean_en, mean_ta = get_meaning(code, flag)

                    extracted_items.append(LabValueSchema(
                        test_code=code,
                        value=val,
                        unit=unit,
                        ref_low=ref_low,
                        ref_high=ref_high,
                        flag=flag,
                        meaning_en=mean_en,
                        meaning_ta=mean_ta
                    ))
                    found = True
                    break
            if found:
                break

    return extracted_items

def generate_doctor_questions(values: List[LabValueSchema], trend_notes: List[str] = None) -> List[str]:
    questions = []
    has_abnormal = False

    for v in values:
        if v.flag in ["LOW", "HIGH", "CRITICAL"]:
            has_abnormal = True
            if v.test_code == "HB":
                questions.append("What is causing my low haemoglobin, and would iron supplements or dietary changes help?")
            elif v.test_code == "PLT":
                questions.append("Do I need repeat platelet testing or hospital observation for fever?")
            elif v.test_code in ["FBS", "PPBS", "RBS", "HBA1C"]:
                questions.append("Should my diabetes medication or meal plan be adjusted based on these glucose numbers?")
            elif v.test_code == "CREAT":
                questions.append("Are there specific medications or hydration steps to protect my kidney function?")

    if trend_notes:
        questions.append("My recent tests show a notable drop over time — what diagnostic tests do you recommend next?")

    if not questions:
        questions = [
            "Are all my test numbers within an optimal range for my age and health history?",
            "When should I repeat these routine blood tests for monitoring?",
            "Are there lifestyle or dietary habits I can adopt to keep these markers healthy?"
        ]

    # Return top 3 questions
    return questions[:3]
