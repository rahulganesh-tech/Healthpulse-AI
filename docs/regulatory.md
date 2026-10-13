# HealthPulse AI — Regulatory & Medical Device Software Classification Analysis

**Document Code**: REG-003-OP-MDSW  
**Challenge**: SEVA First Innovation Challenge 2026 · DTU  
**Theme**: Theme 2 — Local Community Level Healthcare & Well-being  
**Applicant**: Team HealthPulse AI, Dr. M.G.R. Educational and Research Institute, Chennai  

---

## 1. Executive Summary & Regulatory Positioning

HealthPulse AI is explicitly designed, engineered, and deployed as an **algorithmic health information, safety screening, and public-care navigation tool**. It is **not** a diagnostic medical device, nor does it provide therapeutic prescriptions, dosage calculations, or clinical treatment plans.

Every patient interaction, Doctor Handoff Card, and digital screen prominently states:
> *"Health information and navigation. Not a diagnosis. Not a substitute for a doctor. If you feel worse, call 108."*

Under the Central Drugs Standard Control Organisation (**CDSCO**) draft guidance on *Software as a Medical Device (SaMD) and Medical Device Software (Oct 2025)*, software that exclusively provides patient education, clinical risk navigation, and public health surveillance without autonomous diagnostic finality operates in the informational pre-clinical category.

---

## 2. Intended Use Statement

### Intended Use
HealthPulse AI is intended to assist citizens in rural and semi-urban Tamil Nadu by:
1. Identifying recognized life-threatening red-flag danger signs (e.g., suspected acute coronary syndrome, stroke, maternal eclampsia, severe dehydration) and prioritizing emergency mobilization (108 Ambulance).
2. Guiding non-emergency cases to appropriate public healthcare facilities (Primary Health Centres / Ayushman Arogya Mandirs) within 24–48 hours.
3. Structuring citizen-reported symptoms and laboratory biomarkers into a standardized one-page **Doctor Handoff Card** for Primary Health Centre Medical Officers.
4. Aggregating anonymous, syndromic data into a weekly district surveillance signal (**Community Pulse**) for early outbreak notification.

### Contraindications & Restrictions
- Not intended for automated triage in tertiary trauma emergency departments.
- Not intended to recommend specific pharmaceutical agents, dosages, or surgical procedures.
- Never overrides a qualified healthcare practitioner's direct clinical assessment.

---

## 3. Anticipated CDSCO Risk Classification (If Commercialized for Direct Clinical Decision Support)

If HealthPulse AI were evolved into an active Clinical Decision Support System (CDSS) providing diagnostic recommendations to clinicians, its anticipated classification under CDSCO Medical Device Rules 2017 & 2025 updates would be:

| Risk Category | Classification | Rationale |
| :--- | :--- | :--- |
| **Current Prototype (Health Navigation)** | **Exempt / Informational Software** | Serves as citizen health literacy, danger sign checklist, and public healthcare navigation. |
| **Future Clinical Upgrade (PHC Triage CDSS)** | **Class B (Low-Moderate Risk)** | Assisting PHC doctors in triaging non-critical rural presentations with human-in-the-loop sign-off. |
| **Autonomous Emergency Dispatch Engine** | **Class C (Moderate-High Risk)** | If software autonomously dispatched emergency resources without paramedic verification. |

---

## 4. Required Roadmap for Formal Clinical Validation & Certification

To transition from TRL-5 (prototype demonstrated in simulated rural environment) to formal CDSCO Class B SaMD certification:

1. **Quality Management System (QMS)**:
   - Implementation of **ISO 13485:2016** (Medical devices — Quality management systems).
   - Compliance with **IEC 62304:2015** (Medical device software — Software lifecycle processes, Class B software safety category).
2. **Clinical Evaluation & Prospective Validation**:
   - Institutional Ethics Committee (IEC) approved prospective cohort study across 3–5 rural PHCs in Tirunelveli district.
   - Ground-truth concordance benchmarking against panel of 3 independent General Physicians / Emergency Specialists.
   - Non-inferiority safety trial demonstrating 0% under-triage on emergency presentations.
3. **Software Risk Management (ISO 14971:2019)**:
   - Failure Mode and Effects Analysis (FMEA) for speech-to-text accent variations and OCR misreads.
   - Deterministic red-flag safety rule engine architecture preventing statistical model downgrades.
4. **Change Control & Algorithmic Governance**:
   - Strict versioning of `rules/red_flags.yaml` and `models/triage.joblib`.
   - Cryptographic approval audit trails with Clinical Reviewer digital signatures before runtime updates.
