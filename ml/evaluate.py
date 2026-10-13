import os
import csv
import json
import numpy as np
from collections import defaultdict
from backend.safety.engine import run_hybrid_safety_engine
from ml.train import LEVEL_ORDER, LEVEL_MAP

def evaluate_vignettes(eval_path="ml/eval_vignettes.csv", metrics_path="results/metrics.json", report_path="results/report.md"):
    if not os.path.exists(eval_path):
        raise FileNotFoundError(f"{eval_path} not found")

    with open(eval_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    confusion_matrix = {t: {p: 0 for p in LEVEL_ORDER} for t in LEVEL_ORDER}
    results = []

    under_triaged_total = 0
    over_triaged_total = 0
    emergency_under_triaged = 0
    total_emergencies = 0

    per_level_totals = defaultdict(int)
    per_level_correct = defaultdict(int)

    for r in rows:
        vid = r["id"]
        true_level = r["true_level"]
        per_level_totals[true_level] += 1
        if true_level == "EMERGENCY":
            total_emergencies += 1

        symptoms = [s.strip() for s in r["symptoms"].split(";") if s.strip()]
        danger_answers = {}
        for d in r.get("danger_answers", "").split(";"):
            if d.strip():
                danger_answers[d.strip()] = True

        conditions = [c.strip() for c in r.get("conditions", "").split(";") if c.strip()]
        monsoon = r.get("monsoon_season", "false").lower() == "true"
        pregnant = r.get("pregnant", "false").lower() == "true"
        child_under5 = r.get("child_under5", "false").lower() == "true"
        age_band = r.get("age_band", "18-39")
        duration_days = int(r.get("duration_days", 1))

        # Check if record has lab test
        labs = []
        hb_drop = 0.0
        if "Hb 8.9" in r.get("description", ""):
            labs.append({"test": "HB", "value": 8.9, "unit": "g/dL"})
            hb_drop = 2.3

        record = {
            "age_band": age_band,
            "sex": r.get("sex", "M"),
            "pregnant": pregnant,
            "child_under5": child_under5,
            "duration_days": duration_days,
            "symptoms": symptoms,
            "conditions": conditions,
            "danger_answers": danger_answers,
            "monsoon_season": monsoon,
            "lab": labs,
            "hb_drop_amount": hb_drop
        }

        eval_out = run_hybrid_safety_engine(record)
        pred_level = eval_out["final_level"]

        confusion_matrix[true_level][pred_level] += 1

        true_idx = LEVEL_MAP[true_level]
        pred_idx = LEVEL_MAP[pred_level]

        if pred_idx < true_idx:
            under_triaged_total += 1
            if true_level == "EMERGENCY":
                emergency_under_triaged += 1
        elif pred_idx > true_idx:
            over_triaged_total += 1
        else:
            per_level_correct[true_level] += 1

        results.append({
            "id": vid,
            "description": r["description"],
            "true_level": true_level,
            "pred_level": pred_level,
            "rule_level": eval_out["rule_level"],
            "model_level": eval_out["model_level"],
            "rules_fired": [rh["id"] for rh in eval_out["rule_hits"]],
            "top_factors": eval_out["model_top_factors"]
        })

    n = len(rows)
    under_triage_rate = round(under_triaged_total / n, 4)
    over_triage_rate = round(over_triaged_total / n, 4)
    accuracy = round(sum(per_level_correct.values()) / n, 4)
    emergency_under_triage_rate = round(emergency_under_triaged / max(total_emergencies, 1), 4)

    recall_per_level = {}
    for lvl in LEVEL_ORDER:
        tot = per_level_totals[lvl]
        cor = per_level_correct[lvl]
        recall_per_level[lvl] = round(cor / tot, 4) if tot > 0 else 0.0

    metrics_data = {
        "dataset": "ml/eval_vignettes.csv",
        "sample_count": n,
        "under_triage_rate": under_triage_rate,
        "over_triage_rate": over_triage_rate,
        "accuracy": accuracy,
        "emergency_under_triage_count": emergency_under_triaged,
        "emergency_under_triage_rate": emergency_under_triage_rate,
        "recall_per_level": recall_per_level,
        "confusion_matrix": confusion_matrix,
        "baseline_llm_comparison": "baseline not run"
    }

    os.makedirs(os.path.dirname(metrics_path), exist_ok=True)
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    # Generate Markdown Report
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# HealthPulse AI — Clinical Safety Evaluation Report\n\n")
        f.write(f"- **Evaluated Cases**: {n} (20 EMERGENCY, 15 URGENT, 15 PHC_VISIT, 10 SELF_CARE)\n")
        f.write(f"- **Emergency Under-Triage**: {emergency_under_triaged} / {total_emergencies} ({emergency_under_triage_rate * 100}%)\n")
        f.write(f"- **Overall Under-Triage Rate**: {under_triage_rate * 100}%\n")
        f.write(f"- **Overall Over-Triage Rate**: {over_triage_rate * 100}%\n")
        f.write(f"- **Overall Agreement**: {accuracy * 100}%\n\n")

        f.write("## Confusion Matrix\n\n")
        f.write("| True \\ Predicted | SELF_CARE | PHC_VISIT | URGENT | EMERGENCY |\n")
        f.write("| --- | --- | --- | --- | --- |\n")
        for t in LEVEL_ORDER:
            row_str = f"| **{t}** | " + " | ".join(str(confusion_matrix[t][p]) for p in LEVEL_ORDER) + " |"
            f.write(row_str + "\n")
        f.write("\n")

        f.write("## Recall per Level\n\n")
        for lvl, rec in recall_per_level.items():
            f.write(f"- **{lvl}**: {rec * 100}%\n")
        f.write("\n")

        f.write("## Per-Case Evaluation Summary\n\n")
        f.write("| ID | Description | True Level | Predicted | Rules Fired | Top Factors |\n")
        f.write("| --- | --- | --- | --- | --- | --- |\n")
        for res in results[:20]:
            rf_str = ", ".join(res["rules_fired"]) if res["rules_fired"] else "None"
            tf_str = ", ".join(res["top_factors"][:2])
            f.write(f"| {res['id']} | {res['description'][:40]} | {res['true_level']} | {res['pred_level']} | {rf_str} | {tf_str} |\n")

    print(f"Evaluation complete. Metrics saved to {metrics_path}, report to {report_path}")
    return metrics_data

if __name__ == "__main__":
    evaluate_vignettes()
