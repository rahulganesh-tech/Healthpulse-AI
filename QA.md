# HealthPulse AI — Judge Q&A Defense Guide

**Challenge**: SEVA First Innovation Challenge 2026 · DTU  
**Theme**: Healthcare & Community Well-being  
**Team**: HealthPulse AI, Dr. M.G.R. Educational and Research Institute, Chennai  

---

### Q1: "Isn't this just a wrapper around ChatGPT / generic LLMs?"
**Answer**:
No, absolutely not. HealthPulse AI utilizes a strict **deterministic, multi-layered safety architecture**:
1. **Layer 1 (Safety Rules Engine)**: Doctor-reviewed, versioned YAML rules (`rules/red_flags.yaml`) evaluate danger signs first. If a danger sign fires, urgency is set to EMERGENCY and **cannot be lowered by any subsequent component**.
2. **Layer 2 (Calibrated ML Model)**: Cases without red flags are triaged using a calibrated statistical ensemble with a 5x penalty against under-triage.
3. **Layer 3 (Language Models)**: LLMs are **only used to format plain-language explanations**. The LLM receives the pre-calculated urgency and is strictly prohibited from altering or determining clinical urgency.
This was tested across 60 rigorous clinical vignettes with **0% emergency under-triage**.

---

### Q2: "What if the system is wrong?"
**Answer**:
Safety is engineered through defense-in-depth:
- **Asymmetric Class Weights**: Machine learning training penalizes under-triage 5x more heavily than over-triage.
- **Confidence Escalation Guard**: If the statistical confidence of the model is below 60%, the system automatically bumps the case one level higher in urgency.
- **Always-Present 108 Button**: A prominent emergency button is persistently visible on every screen.
- **Clinician Feedback Loop**: PHC doctors can click "Urgency too high / too low" on any handoff card, directly feeding ongoing model calibration.

---

### Q3: "Is this considered a medical device under Indian regulations?"
**Answer**:
HealthPulse AI is deliberately positioned as **health literacy, danger screening, and public-care navigation**, not an autonomous diagnostic or prescribing device. Under the CDSCO draft guidance on *Software as a Medical Device (Oct 2025)*, informational and educational triage navigators are distinguished from diagnostic devices. If transitioned into formal Clinical Decision Support for doctors in the future, it would follow the Class B certification pathway outlined in [`docs/regulatory.md`](docs/regulatory.md).

---

### Q4: "Are you using real patient data?"
**Answer**:
No. For ethical rigor and DPDP Act 2023 compliance, our prototype strictly uses **calibrated synthetic demo data** clearly labelled with a *"DEMO DATA"* banner on staff screens. District numbers are calibrated to official benchmarks (RHS, HMIS, and NFHS-5 district figures for Tirunelveli). A formal pilot study with an Institutional Ethics Committee approved protocol is planned for field deployment.

---

### Q5: "How do you protect patient privacy under the DPDP Act 2023?"
**Answer**:
We enforce privacy by design:
- **Data Minimisation**: No citizen names, phone numbers, or exact dates of birth are collected.
- **Ephemeral Sessions**: WhatsApp session identifiers are salted and hashed.
- **Right to Erasure**: Citizens can trigger `DELETE /api/me` at any time to permanently delete their checks, reports, and lab values.
- **Privacy Threshold in Surveillance**: Community Pulse suppresses any cell with fewer than 10 counts in a week (showing `<10`) to eliminate re-identification risk.
- **Cryptographic Audit Trail**: All staff accesses and rule updates are recorded in an append-only, SHA-256 hash-chained log.

---

### Q6: "How does this scale to rural India?"
**Answer**:
- **Zero-Friction Access**: Operates over simple web links and Twilio WhatsApp Sandbox without requiring app store downloads.
- **Vernacular First**: Built with Tamil voice recognition and read-back audio, designed to run smoothly on low-cost Android phones at 360 px width.
- **Public Health Leverage**: Directs patients to free, underutilized government resources first (Primary Health Centres, Ayushman Arogya Mandirs, 108 Emergency Service, and eSanjeevani teleconsultation).
