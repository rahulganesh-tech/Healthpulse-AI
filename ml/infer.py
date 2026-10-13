import os
import joblib
import numpy as np
from ml.train import build_feature_vector, LEVEL_ORDER, LEVEL_MAP, REV_LEVEL_MAP

_MODEL_BUNDLE = None

def get_model():
    global _MODEL_BUNDLE
    if _MODEL_BUNDLE is None:
        model_path = "models/triage.joblib"
        if not os.path.exists(model_path):
            from ml.train import train_and_export
            _MODEL_BUNDLE = train_and_export()
        else:
            _MODEL_BUNDLE = joblib.load(model_path)
    return _MODEL_BUNDLE

def predict_triage(structured_record):
    bundle = get_model()
    model = bundle["model"]
    base_lr = bundle["base_lr"]
    feature_names = bundle["feature_names"]

    x = build_feature_vector(structured_record)
    x_2d = x.reshape(1, -1)

    probs = model.predict_proba(x_2d)[0]
    prob_dict = {LEVEL_ORDER[i]: float(probs[i]) for i in range(len(LEVEL_ORDER))}

    p_urgent = prob_dict.get("URGENT", 0.0)
    top_idx = int(np.argmax(probs))
    top_prob = float(probs[top_idx])

    # Decision rule:
    # 1. if P(URGENT) >= 0.25 -> URGENT (deliberately low threshold)
    # 2. otherwise the most likely class
    # 3. if the top probability is below 0.60 -> move one level up
    if p_urgent >= 0.25 and top_idx < LEVEL_MAP["URGENT"]:
        decided_idx = LEVEL_MAP["URGENT"]
    else:
        decided_idx = top_idx

    confidence_bumped = False
    if top_prob < 0.60 and decided_idx < len(LEVEL_ORDER) - 1:
        decided_idx += 1
        confidence_bumped = True

    model_level = LEVEL_ORDER[decided_idx]

    # Explain top 3 contributing features
    coefs = base_lr.coef_[decided_idx]
    contributions = x * coefs
    top_feat_indices = np.argsort(contributions)[::-1][:3]

    human_friendly_features = []
    duration = structured_record.get("duration_days", 1)
    symptoms = structured_record.get("symptoms", [])
    monsoon = structured_record.get("monsoon_season", False)

    for idx in top_feat_indices:
        fn = feature_names[idx]
        if fn == "duration_norm":
            human_friendly_features.append(f"symptoms persisting for {duration} days")
        elif fn == "monsoon_season" and monsoon:
            human_friendly_features.append("monsoon season vector risk")
        elif fn in symptoms:
            human_friendly_features.append(fn.replace("_", " "))
        elif contributions[idx] > 0.01:
            human_friendly_features.append(fn.replace("_", " "))

    if not human_friendly_features:
        if "fever" in symptoms:
            human_friendly_features.append(f"fever for {duration} days")
        if monsoon:
            human_friendly_features.append("monsoon season")
        if len(symptoms) > 1:
            human_friendly_features.append(symptoms[1].replace("_", " "))

    # Deduplicate while preserving order
    seen = set()
    deduped_features = []
    for f in human_friendly_features:
        if f not in seen:
            seen.add(f)
            deduped_features.append(f)

    return {
        "model_level": model_level,
        "model_probs": prob_dict,
        "confidence": top_prob,
        "confidence_bumped": confidence_bumped,
        "top_factors": deduped_features[:3],
        "model_version": bundle.get("model_version", "triage-0.1")
    }
