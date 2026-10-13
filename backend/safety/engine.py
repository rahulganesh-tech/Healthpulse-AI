import os
import yaml
import hashlib
import re
from typing import Dict, Any, List, Tuple
from ml.infer import predict_triage
from ml.train import LEVEL_ORDER, LEVEL_MAP

RULES_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "rules", "red_flags.yaml")
MINIMISING_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "rules", "minimising_phrases.yaml")
LEXICON_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "rules", "symptom_lexicon.yaml")

_ACTIVE_RULES = None
_RULES_SHA256 = None
_MINIMISING_PHRASES = None
_LEXICON = None

def load_rules():
    global _ACTIVE_RULES, _RULES_SHA256
    if _ACTIVE_RULES is None:
        norm_path = os.path.abspath(RULES_PATH)
        with open(norm_path, "r", encoding="utf-8") as f:
            content = f.read()
            _RULES_SHA256 = hashlib.sha256(content.encode("utf-8")).hexdigest()
            _ACTIVE_RULES = yaml.safe_load(content)
    return _ACTIVE_RULES, _RULES_SHA256

def load_minimising_phrases():
    global _MINIMISING_PHRASES
    if _MINIMISING_PHRASES is None:
        norm_path = os.path.abspath(MINIMISING_PATH)
        with open(norm_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            _MINIMISING_PHRASES = data.get("phrases", [])
    return _MINIMISING_PHRASES

def load_lexicon():
    global _LEXICON
    if _LEXICON is None:
        norm_path = os.path.abspath(LEXICON_PATH)
        with open(norm_path, "r", encoding="utf-8") as f:
            _LEXICON = yaml.safe_load(f)
    return _LEXICON

def check_anti_minimisation(raw_text: str) -> Tuple[str, List[str]]:
    """
    Detects minimising phrases (e.g. 'gas dhaan', 'just gas'),
    strips them from the text to prevent dilution of symptoms,
    and returns cleaned text + detected phrases.
    """
    phrases = load_minimising_phrases()
    detected = []
    cleaned_text = raw_text

    for item in phrases:
        p = item["phrase"]
        # Word boundary or flexible pattern
        pattern = re.compile(rf"(?i)\b{re.escape(p)}\b")
        if pattern.search(cleaned_text):
            detected.append(item.get("canonical", p))
            cleaned_text = pattern.sub("", cleaned_text)

    # Clean whitespace
    cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()
    return cleaned_text, list(set(detected))

def parse_symptoms_and_duration(text: str) -> Tuple[List[str], int]:
    """
    Extracts canonical symptoms and duration from raw text using symptom_lexicon.yaml
    """
    lexicon = load_lexicon()
    found_symptoms = []

    text_lower = text.lower()
    for item in lexicon.get("symptoms", []):
        cid = item["id"]
        for syn in item.get("synonyms", []):
            if syn.lower() in text_lower:
                found_symptoms.append(cid)
                break

    duration_days = 1
    for dur in lexicon.get("durations", []):
        pat = dur["pattern"]
        m = re.search(pat, text_lower)
        if m:
            if "value" in dur:
                duration_days = dur["value"]
            elif m.groups():
                try:
                    duration_days = int(m.group(1))
                except ValueError:
                    pass
            break

    return sorted(list(set(found_symptoms))), duration_days

def evaluate_red_flags(record: Dict[str, Any]) -> List[Dict[str, Any]]:
    rules_data, sha = load_rules()
    rules = rules_data.get("rules", [])

    symptoms = set(record.get("symptoms", []))
    danger_answers = record.get("danger_answers", {})
    danger_true = {k for k, v in danger_answers.items() if v is True or v == "yes" or v == "true" or v == 1}
    conditions = set(record.get("conditions", []))
    duration = record.get("duration_days", 1)
    is_pregnant = bool(record.get("pregnant", False))
    is_child = bool(record.get("child_under5", False) or record.get("age_band") == "0-4")
    age_band = record.get("age_band", "18-39")
    is_age_40_plus = age_band in ["40-59", "60+"]
    vitals = record.get("vitals", {})
    labs = record.get("lab", [])
    context = record.get("context", {})

    fired_rules = []

    for r in rules:
        rid = r["id"]
        cond = r.get("conditions", {})
        fired = False

        # Group pre-checks
        grp = r.get("group", "any")
        if grp == "pregnant" and not is_pregnant:
            continue
        if grp == "child_under5" and not is_child:
            continue

        # RF-CHEST-01
        if rid == "RF-CHEST-01":
            has_chest = any(s in symptoms for s in ["chest_pain", "chest_pressure"])
            has_danger = any(s in danger_true for s in ["sweating", "breathless", "breathless_at_rest", "arm_jaw_pain"])
            has_symp_modifier = any(s in symptoms for s in ["sweating", "breathless", "arm_jaw_pain"])
            if has_chest and (has_danger or has_symp_modifier or is_age_40_plus):
                fired = True

        # RF-STROKE-02
        elif rid == "RF-STROKE-02":
            stroke_danger = ["face_droop", "one_sided_weakness", "slurred_speech", "paralysis"]
            if any(s in danger_true or s in symptoms for s in stroke_danger):
                fired = True

        # RF-BREATH-03
        elif rid == "RF-BREATH-03":
            breath_danger = ["breathless_at_rest", "blue_lips", "cant_speak_sentences", "cant_speak"]
            if any(s in danger_true for s in breath_danger) or "severe_breathlessness" in symptoms:
                fired = True

        # RF-CONSC-04
        elif rid == "RF-CONSC-04":
            consc_danger = ["unconscious", "fits", "seizures", "seizure", "new_confusion", "confusion"]
            if any(s in danger_true or s in symptoms for s in consc_danger):
                fired = True

        # RF-BLEED-05
        elif rid == "RF-BLEED-05":
            bleed_danger = ["vomiting_blood", "black_stools", "heavy_bleeding"]
            if any(s in danger_true or s in symptoms for s in bleed_danger):
                fired = True

        # RF-SNAKE-06
        elif rid == "RF-SNAKE-06":
            if "snake_bite" in danger_true or "snake_bite" in symptoms or "poisonous_bite" in symptoms:
                fired = True

        # RF-PREG-07
        elif rid == "RF-PREG-07":
            if is_pregnant:
                preg_danger = ["bleeding", "severe_headache_blurred_vision", "fits", "severe_belly_pain", "baby_moving_less", "water_broke"]
                if any(s in danger_true for s in preg_danger) or any(s in symptoms for s in ["pregnancy_bleeding", "blurred_vision", "severe_headache"]):
                    fired = True

        # RF-CHILD-08
        elif rid == "RF-CHILD-08":
            if is_child:
                child_danger = ["cannot_drink", "vomits_everything", "fits", "hard_to_wake", "fast_difficult_breathing", "very_sleepy"]
                if any(s in danger_true for s in child_danger) or any(s in symptoms for s in ["not_drinking", "very_sleepy", "fast_difficult_breathing"]):
                    fired = True

        # RF-FEVER-09
        elif rid == "RF-FEVER-09":
            if "fever" in symptoms:
                if any(s in danger_true for s in ["stiff_neck", "rash_not_fading", "dark_rash"]):
                    fired = True

        # RF-HEAT-10
        elif rid == "RF-HEAT-10":
            if context.get("heat_exposure", False) or "heat_exposure" in symptoms or "sun_exposure" in symptoms:
                if any(s in danger_true for s in ["confusion", "fainting", "hot_dry_skin"]):
                    fired = True

        # RF-DENGUE-11
        elif rid == "RF-DENGUE-11":
            if "fever" in symptoms and duration >= 2:
                dengue_danger = ["bleeding_gums_nose", "bleeding_gums", "red_spots", "severe_belly_pain", "vomiting_frequent", "extreme_weakness"]
                if any(s in danger_true or s in symptoms for s in dengue_danger):
                    fired = True

        # RF-DEHYD-12
        elif rid == "RF-DEHYD-12":
            if any(s in symptoms for s in ["diarrhoea", "vomiting", "loose_motions"]):
                dehyd_danger = ["no_urine_8h", "dizzy_standing", "cant_keep_fluids", "severe_dizziness"]
                if any(s in danger_true for s in dehyd_danger):
                    fired = True

        # RF-SUGAR-13
        elif rid == "RF-SUGAR-13":
            if "diabetes" in conditions:
                sugar_danger = ["shaking_sweating", "drowsy", "confused", "shaking"]
                if any(s in danger_true or s in symptoms for s in sugar_danger):
                    fired = True

        # RF-FEVER-14
        elif rid == "RF-FEVER-14":
            if "fever" in symptoms and duration > 7:
                fired = True

        # RF-MIND-15
        elif rid == "RF-MIND-15":
            mind_danger = ["self_harm", "suicide_thoughts", "want_to_die"]
            if any(s in danger_true or s in symptoms for s in mind_danger):
                fired = True

        # Lab Rules
        elif rid == "LAB-HB-01":
            for lab in labs:
                if lab.get("test") == "HB":
                    val = float(lab.get("value", 12.0))
                    if val < 7.0:
                        fired = True
                    elif val <= 9.9:
                        # Fires at PHC_VISIT level
                        fired_rules.append({
                            "id": "LAB-HB-01",
                            "level": "PHC_VISIT",
                            "action": "phc_today",
                            "message_en": "Moderate anaemia (Haemoglobin 7.0–9.9 g/dL). Visit PHC within 24–48 hours for iron therapy and dietary assessment.",
                            "message_ta": "மிதமான ரத்த சோகை (Hb 7.0–9.9 g/dL). ஆரம்ப சுகாதார நிலையத்திற்கு சென்று சிகிச்சை பெறவும்."
                        })
                        continue

        elif rid == "LAB-HB-02":
            # Evaluated if trend flag or drop is present
            if record.get("hb_drop_amount", 0.0) >= 2.0:
                fired = True

        elif rid == "LAB-PLT-01":
            for lab in labs:
                if lab.get("test") == "PLT":
                    val = float(lab.get("value", 200000))
                    if val < 20000:
                        fired = True
                    elif val < 100000 and "fever" in symptoms:
                        fired_rules.append({
                            "id": "LAB-PLT-01",
                            "level": "URGENT",
                            "action": "phc_today",
                            "message_en": "Platelets below 100,000 /µL with fever indicates urgent dengue risk. Visit PHC today.",
                            "message_ta": "காய்ச்சலுடன் ரத்த தட்டணுக்கள் 1 லட்சத்திற்கு கீழ் உள்ளது. இன்றே மருத்துவரிடம் செல்லவும்."
                        })
                        continue

        elif rid == "LAB-GLU-01":
            for lab in labs:
                if lab.get("test") in ["FBS", "PPBS", "RBS"]:
                    val = float(lab.get("value", 100))
                    if val >= 400 or val <= 54:
                        fired = True

        elif rid == "LAB-CREAT-01":
            for lab in labs:
                if lab.get("test") == "CREAT":
                    val = float(lab.get("value", 1.0))
                    if val >= 3.0:
                        fired = True

        if fired:
            fired_rules.append({
                "id": r["id"],
                "level": r["level"],
                "action": r["action"],
                "message_en": r["message_en"],
                "message_ta": r["message_ta"]
            })

    return fired_rules

def run_hybrid_safety_engine(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the 3-layer safety pipeline:
    1. Red-flag rules (doctor-reviewed YAML) can only raise urgency.
    2. Calibrated ML triage model for unflagged cases.
    3. Final combine: max(rule_level, model_level), confidence bump.
    CRISIS (RF-MIND-15) overrides everything.
    """
    rules_data, rules_sha = load_rules()
    fired_rules = evaluate_red_flags(record)

    # Check for CRISIS
    is_crisis = any(r["level"] == "CRISIS" or r["id"] == "RF-MIND-15" for r in fired_rules)
    if is_crisis:
        return {
            "final_level": "CRISIS",
            "rule_level": "CRISIS",
            "model_level": "CRISIS",
            "rule_hits": fired_rules,
            "model_probs": {},
            "model_top_factors": ["Self-harm or crisis screening triggered"],
            "confidence": 1.0,
            "rules_version": rules_data.get("version", "0.3-draft"),
            "rules_sha256": rules_sha,
            "model_version": "triage-0.1",
            "action": "tele_manas",
            "helpline": "Tele-MANAS 14416 / 108"
        }

    # Highest rule urgency
    rule_level = "SELF_CARE"
    for r in fired_rules:
        lvl = r["level"]
        if LEVEL_MAP.get(lvl, 0) > LEVEL_MAP.get(rule_level, 0):
            rule_level = lvl

    # Run ML Model
    ml_res = predict_triage(record)
    model_level = ml_res["model_level"]
    top_factors = ml_res["top_factors"]
    confidence = ml_res["confidence"]

    # Prompt 4 Part D Combine logic:
    # final = max(rule_level, model_level)
    # if model_confidence < 0.60 and no rule fired: final = one level up
    rule_idx = LEVEL_MAP[rule_level]
    model_idx = LEVEL_MAP[model_level]
    final_idx = max(rule_idx, model_idx)

    confidence_boosted = False
    if len(fired_rules) == 0 and confidence < 0.60 and final_idx < len(LEVEL_ORDER) - 1:
        final_idx += 1
        confidence_boosted = True

    final_level = LEVEL_ORDER[final_idx]

    return {
        "final_level": final_level,
        "rule_level": rule_level,
        "model_level": model_level,
        "rule_hits": fired_rules,
        "model_probs": ml_res["model_probs"],
        "model_top_factors": top_factors,
        "confidence": confidence,
        "confidence_bumped": confidence_boosted,
        "rules_version": rules_data.get("version", "0.3-draft"),
        "rules_sha256": rules_sha,
        "model_version": ml_res["model_version"]
    }
