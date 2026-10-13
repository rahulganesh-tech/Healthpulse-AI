# HealthPulse AI — Clinical Safety Evaluation Report

- **Evaluated Cases**: 60 (20 EMERGENCY, 15 URGENT, 15 PHC_VISIT, 10 SELF_CARE)
- **Emergency Under-Triage**: 0 / 20 (0.0%)
- **Overall Under-Triage Rate**: 1.67%
- **Overall Over-Triage Rate**: 11.67%
- **Overall Agreement**: 86.67%

## Confusion Matrix

| True \ Predicted | SELF_CARE | PHC_VISIT | URGENT | EMERGENCY |
| --- | --- | --- | --- | --- |
| **SELF_CARE** | 9 | 0 | 1 | 0 |
| **PHC_VISIT** | 1 | 11 | 2 | 1 |
| **URGENT** | 0 | 0 | 12 | 3 |
| **EMERGENCY** | 0 | 0 | 0 | 20 |

## Recall per Level

- **SELF_CARE**: 90.0%
- **PHC_VISIT**: 73.33%
- **URGENT**: 80.0%
- **EMERGENCY**: 100.0%

## Per-Case Evaluation Summary

| ID | Description | True Level | Predicted | Rules Fired | Top Factors |
| --- | --- | --- | --- | --- | --- |
| EV-01 | Murugan: 58M chest pain sweating, wife a | EMERGENCY | EMERGENCY | RF-CHEST-01 | chest pain, sweating |
| EV-02 | Selvi: 24F pregnant severe headache blur | EMERGENCY | EMERGENCY | RF-PREG-07 | severe headache, blurred vision |
| EV-03 | Kavya: 3F loose motions not drinking let | EMERGENCY | EMERGENCY | RF-CHILD-08 | vomiting, age 0-4 |
| EV-04 | 62M acute face droop and slurred speech | EMERGENCY | EMERGENCY | RF-STROKE-02 | slurred speech, face droop |
| EV-05 | 45M severe breathlessness at rest blue l | EMERGENCY | EMERGENCY | RF-BREATH-03 | breathless, cond asthma |
| EV-06 | 30M unconscious following head trauma | EMERGENCY | EMERGENCY | RF-CONSC-04 | age 18-39 |
| EV-07 | 50M vomiting frank blood | EMERGENCY | EMERGENCY | RF-BLEED-05 | black stools, vomiting blood |
| EV-08 | 28F snake bite in paddy field | EMERGENCY | EMERGENCY | RF-SNAKE-06 | snake bite, temp norm |
| EV-09 | 22F high fever with stiff neck and purpu | EMERGENCY | EMERGENCY | RF-FEVER-09 | fever, temp norm |
| EV-10 | 55M heat stroke collapsed in agricultura | EMERGENCY | EMERGENCY | RF-CONSC-04 | age 40-59 |
| EV-11 | 67M crushing chest pain radiating to lef | EMERGENCY | EMERGENCY | RF-CHEST-01 | chest pain, temp norm |
| EV-12 | 2F toddler seizure with high fever | EMERGENCY | EMERGENCY | RF-CONSC-04, RF-CHILD-08 | fever, age 0-4 |
| EV-13 | 32F pregnant 34 weeks sudden vaginal ble | EMERGENCY | EMERGENCY | RF-PREG-07 | is pregnant, temp norm |
| EV-14 | 70F sudden one sided leg paralysis | EMERGENCY | EMERGENCY | RF-STROKE-02 | cond hypertension, age 60+ |
| EV-15 | 48M hematemesis with heavy alcohol histo | EMERGENCY | EMERGENCY | RF-BLEED-05 | vomiting blood, temp norm |
| EV-16 | 18M Russel viper bite to right foot | EMERGENCY | EMERGENCY | RF-SNAKE-06 | snake bite, temp norm |
| EV-17 | 29F pregnant severe epigastric pain and  | EMERGENCY | EMERGENCY | RF-CONSC-04, RF-PREG-07 | is pregnant, temp norm |
| EV-18 | 4M child persistent vomiting everything  | EMERGENCY | EMERGENCY | RF-CHILD-08 | vomiting, age 0-4 |
| EV-19 | 52M severe breathlessness unable to comp | EMERGENCY | EMERGENCY | RF-BREATH-03 | severe breathlessness, temp norm |
| EV-20 | 41M acute chest pressure age 40+ alone | EMERGENCY | EMERGENCY | RF-CHEST-01 | age 40-59 |
