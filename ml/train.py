import json
import hashlib
import os
import datetime
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import MultiLabelBinarizer

LEVEL_ORDER = ["SELF_CARE", "PHC_VISIT", "URGENT", "EMERGENCY"]
LEVEL_MAP = {k: i for i, k in enumerate(LEVEL_ORDER)}
REV_LEVEL_MAP = {i: k for i, k in enumerate(LEVEL_ORDER)}

ALL_SYMPTOMS = [
    "fever", "high_fever", "mild_fever", "chest_pain", "chest_pressure", "sweating",
    "body_pain", "headache", "mild_headache", "severe_headache", "breathless",
    "breathless_at_rest", "severe_breathlessness", "vomiting", "loose_motions", "diarrhoea",
    "dizziness_fainting", "blurred_vision", "cough", "cold_chills", "runny_nose", "sneezing",
    "throat_irritation", "sore_throat", "burning_urine", "frequent_urination", "joint_pain",
    "itchy_rash", "red_spots", "ear_pain", "back_pain", "stomach_pain", "severe_abdominal_pain",
    "unconscious", "fits", "face_droop", "one_sided_weakness", "slurred_speech", "vomiting_blood",
    "black_stools", "snake_bite", "tiredness", "mild_body_ache", "mild_bloating", "minor_cut",
    "wheezing", "deep_cut", "foot_ulcer", "eye_pain", "drowsiness"
]

ALL_CONDITIONS = ["diabetes", "hypertension", "asthma", "heart_disease"]
AGE_BAND_LIST = ["0-4", "5-17", "18-39", "40-59", "60+"]

def build_feature_vector(item):
    feats = []
    # Symptoms multi-hot
    syms = set(item.get("symptoms", []))
    for s in ALL_SYMPTOMS:
        feats.append(1.0 if s in syms else 0.0)

    # Duration
    dur = float(item.get("duration_days", 1))
    feats.append(min(dur, 14.0) / 14.0)

    # Age band one-hot
    ab = item.get("age_band", "18-39")
    for b in AGE_BAND_LIST:
        feats.append(1.0 if ab == b else 0.0)

    # Sex / pregnancy / child
    feats.append(1.0 if item.get("sex", "M") == "F" else 0.0)
    feats.append(1.0 if item.get("pregnant", False) else 0.0)
    feats.append(1.0 if item.get("child_under5", False) else 0.0)

    # Conditions multi-hot
    conds = set(item.get("conditions", []))
    for c in ALL_CONDITIONS:
        feats.append(1.0 if c in conds else 0.0)

    # Temperature
    temp = float(item.get("temp_c", 37.0))
    feats.append((temp - 36.0) / 4.0)

    # Monsoon
    feats.append(1.0 if item.get("monsoon_season", False) else 0.0)

    return np.array(feats, dtype=np.float32)

def train_and_export():
    train_file = "ml/train_vignettes.json"
    if not os.path.exists(train_file):
        from ml.make_vignettes import generate_vignettes
        generate_vignettes(output_path=train_file)

    with open(train_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Compute dataset hash
    with open(train_file, "rb") as f:
        dataset_hash = hashlib.sha256(f.read()).hexdigest()

    X = np.array([build_feature_vector(d) for d in data])
    y = np.array([LEVEL_MAP[d["level"]] for d in data])

    # Class weights: under-triage costs 5x more than over-triage
    # Standard weighting heuristic favoring higher urgency classes
    custom_class_weights = {
        0: 1.0,  # SELF_CARE
        1: 2.0,  # PHC_VISIT
        2: 5.0,  # URGENT
        3: 10.0  # EMERGENCY
    }

    base_lr = LogisticRegression(
        max_iter=1000,
        class_weight=custom_class_weights,
        random_state=42
    )

    # Calibrate probabilities with CalibratedClassifierCV
    calibrated_model = CalibratedClassifierCV(estimator=base_lr, cv=3)
    calibrated_model.fit(X, y)
    base_lr.fit(X, y)

    os.makedirs("models", exist_ok=True)
    model_bundle = {
        "model": calibrated_model,
        "base_lr": base_lr,
        "feature_names": ALL_SYMPTOMS + ["duration_norm"] + [f"age_{b}" for b in AGE_BAND_LIST] + [
            "is_female", "is_pregnant", "child_under5"
        ] + [f"cond_{c}" for c in ALL_CONDITIONS] + ["temp_norm", "monsoon_season"],
        "level_order": LEVEL_ORDER,
        "level_map": LEVEL_MAP,
        "model_version": "triage-0.1",
        "dataset_hash": dataset_hash,
        "trained_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    joblib.dump(model_bundle, "models/triage.joblib")
    print("Model trained and saved to models/triage.joblib")
    return model_bundle

if __name__ == "__main__":
    train_and_export()
