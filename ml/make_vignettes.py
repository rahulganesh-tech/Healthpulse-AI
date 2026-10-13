import json
import random
import yaml
import os

SEED = 42
random.seed(SEED)

AGE_BANDS = ["0-4", "5-17", "18-39", "40-59", "60+"]
SEXES = ["M", "F"]
CHRONIC_CONDITIONS = ["diabetes", "hypertension", "asthma", "heart_disease"]
MILD_EXTRAS = ["mild_tiredness", "mild_loss_of_appetite", "mild_body_ache"]

def generate_vignettes(template_path="ml/vignette_templates.yaml", output_path="ml/train_vignettes.json"):
    with open(template_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    templates = data.get("templates", [])

    dataset = []
    # Generate ~30 variants per template to yield 1,200 samples
    target_per_template = 30

    for tmpl in templates:
        base_level = tmpl["level"]
        base_symptoms = list(tmpl["symptoms"])
        dur_min, dur_max = tmpl.get("duration_days_range", [1, 3])
        tmpl_is_child = tmpl.get("child_under5", False)
        tmpl_is_preg = tmpl.get("pregnant", False)
        tmpl_conds = tmpl.get("conditions", [])

        for i in range(target_per_template):
            # Age band logic
            if tmpl_is_child:
                age_band = "0-4"
                sex = random.choice(SEXES)
                child_under5 = True
                pregnant = False
            elif tmpl_is_preg:
                age_band = random.choice(["18-39", "18-39", "18-39", "40-59"])
                sex = "F"
                child_under5 = False
                pregnant = True
            else:
                age_band = random.choice(AGE_BANDS)
                child_under5 = (age_band == "0-4")
                sex = random.choice(SEXES)
                pregnant = (sex == "F" and age_band in ["18-39", "40-59"] and random.random() < 0.08)

            # Duration
            duration = random.randint(dur_min, dur_max)

            # Symptoms & occasional mild extras
            symptoms = list(base_symptoms)
            if random.random() < 0.25:
                extra = random.choice(MILD_EXTRAS)
                if extra not in symptoms:
                    symptoms.append(extra)

            # Conditions
            conditions = list(tmpl_conds)
            if not conditions and age_band in ["40-59", "60+"] and random.random() < 0.35:
                conditions.append(random.choice(CHRONIC_CONDITIONS))

            # Temperature
            if "fever" in symptoms or "high_fever" in symptoms:
                temp_c = round(random.uniform(37.8, 39.8), 1)
            elif "mild_fever" in symptoms:
                temp_c = round(random.uniform(37.3, 38.0), 1)
            else:
                temp_c = round(random.uniform(36.4, 37.2), 1)

            # Monsoon season: October-December (Tamil Nadu NE monsoon)
            monsoon_season = random.choice([True, False])

            sample = {
                "id": f"SYN-{tmpl['id']}-{i+1:03d}",
                "template_id": tmpl["id"],
                "age_band": age_band,
                "sex": sex,
                "pregnant": pregnant,
                "child_under5": child_under5,
                "duration_days": duration,
                "symptoms": sorted(list(set(symptoms))),
                "conditions": conditions,
                "temp_c": temp_c,
                "monsoon_season": monsoon_season,
                "level": base_level
            }
            dataset.append(sample)

    random.shuffle(dataset)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)

    print(f"Generated {len(dataset)} synthetic training vignettes saved to {output_path}")
    return dataset

if __name__ == "__main__":
    generate_vignettes()
