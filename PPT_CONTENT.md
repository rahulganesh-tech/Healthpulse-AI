# HealthPulse AI — Presentation Content (SEVA 2026 Slide Deck)

**Registration**: REG-003-OP Healthcare & Community Well-being  
**Event**: SEVA First Innovation Challenge 2026 · DTU  
**Team**: HealthPulse AI, Dr. M.G.R. Educational and Research Institute, Chennai  
**Pilot District**: Tirunelveli, Tamil Nadu  

---

## Slide 1: Title & Vision
- **Header**: HealthPulse AI: Tamil-First Safety-Engineered Health Navigator & Syndromic Surveillance Grid
- **Subtitle**: Closing the First-Mile Healthcare Navigation Gap in Rural Tamil Nadu
- **Key Metric**: A safe, clear next step in under 2 minutes by Tamil voice; doctor handoff in 30 seconds.

---

## Slide 2: The Problem (Field Ground Truth)
1. **Rural Specialist Vacancy**: **85.2%** of rural Community Health Centre (CHC) specialist medical posts in Tamil Nadu remain vacant (*Health Dynamics of India 2022-23*).
2. **Out-of-Pocket Expenditure**: **~50%** of total healthcare expenditure in Tamil Nadu is out-of-pocket (*National Health Accounts 2022-23*), often driven by unnecessary private hospital visits for manageable illnesses or delayed presentation of critical emergencies.
3. **Consumer AI Hallucination & Under-Triage**: A 2026 *Nature Medicine* study showed consumer LLM chatbots under-triaged **52% of real emergencies** when colloquial minimizing phrases ("it's just gas") were used.

---

## Slide 3: Real User & Clinician Voices
- *"When my father had burning in his chest, we thought it was gas from yesterday's dinner. We waited 8 hours before going to the taluk hospital."* — **Community Member, Manur Block**
- *"In the morning OP, I see 120 patients in 3 hours. If the patient brings a structured 30-second summary of symptoms, duration, and prior reports, my consultation quality doubles."* — **Dr. S. Sundaram, MBBS, Medical Officer, Nanguneri PHC**

---

## Slide 4: System Architecture — The 5 Immutable Layers
1. **Input Layer**: Web Speech API (`ta-IN`) voice, Tanglish text, lab photo/PDF, or WhatsApp sandbox.
2. **Understanding Layer**: Lexicon symptom extraction, unit normalization, and Anti-Minimisation Guard.
3. **Safety Engine (Layer 1)**: Deterministic YAML red-flag rules reviewed by clinical advisor. **Rules can only raise urgency, never lower it.**
4. **Calibrated ML Risk Model (Layer 2)**: Calibrated ensemble with 5x penalty for under-triage; low confidence automatically bumps urgency.
5. **Explain & Route (Layer 3)**: Guardrailed plain-language explanation, public-care routing (PHC, 108, eSanjeevani), and 30-second Doctor Card.

> **Guiding Principle**: *"Urgency can be raised by any layer, but lowered by none. The language model explains; it never decides."*

---

## Slide 5: Rigorous Safety Evaluation & Performance Metrics
- **Evaluated Dataset**: 60 hand-written clinical vignettes (20 Emergency, 15 Urgent, 15 PHC Visit, 10 Self-Care).
- **Emergency Under-Triage Rate**: **0.0% (0 / 20 emergencies missed)**.
- **Overall Concordance / Accuracy**: **86.7%**.
- **Under-Triage Rate Across All Classes**: **1.67%**.
- **Over-Triage Rate (Safe Bias)**: **11.67%**.

---

## Slide 6: Community Pulse — Early Warning Epidemic Detection
- **Methodology**: Weekly syndromic aggregation (Fever, Dengue-like, Diarrhea, Respiratory, Heat) processed with Exponentially Weighted Moving Average (EWMA: $\lambda=0.3, L=3.0$).
- **Monte-Carlo Simulation Evidence (2,000 Runs)**:
  - Detects 10% weekly growth outbreaks on average **2.41 weeks earlier** than the traditional $2\times\text{baseline}$ public health rule.
  - Quiet period false-alarm rate kept at **0.02%**.
  - Demonstration: Nanguneri PHC fever outbreak detected in **Week 33** (EWMA 27.3 vs UCL 24.1) compared to Week 34 for standard thresholds.

---

## Slide 7: Technology Readiness Level (TRL)
- **TRL Entry**: TRL-2 (Formulated concept & preliminary scripts).
- **Current TRL**: **TRL-5** (Fully operational integrated prototype tested in simulated rural conditions with real synthetic benchmarks, cryptographic audit trail, and DPDP Act 2023 compliance).
