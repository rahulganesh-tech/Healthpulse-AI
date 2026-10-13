# HealthPulse AI — 4-Minute Presentation Demo Script

**SEVA First Innovation Challenge 2026** · DTU · Theme 2: Healthcare & Community Well-being  
**Team**: HealthPulse AI, Dr. M.G.R. Educational and Research Institute, Chennai  
**Pilot District**: Tirunelveli, Tamil Nadu  

---

## Quick Setup & Demo Mode
- **Reset Demo**: Click **"Reset Demo Data"** in the top navigation or Admin menu to ensure clean state.
- **Demo Guide Toggle**: Click **"Show Demo Guide"** in the top bar to display on-screen prompter and 1-click persona loaders!

---

## 4-Minute Presentation Walkthrough

### Part 1: The Emergency Caught (60 Seconds) — Persona: Murugan (58, M, Manur)
- **Problem Context**: Rural patients frequently downplay fatal cardiac events as gastrointestinal indigestion ("gas dhaan" / "just gas").
- **Action**:
  1. Open Citizen Home screen. Select Tamil language.
  2. Tap **Microphone** or click **"Load Murugan"** from Demo Guide.
  3. Speak / enter: *"nenju vali, romba viyarvai"* (chest pain, heavy sweating), and add *"gas dhaan"*.
  4. Notice the **Anti-Minimisation Alert**:
     > *"We noticed 'gas dhaan'. We did not use this to lower urgency."*
  5. Complete danger screening questions.
- **Result**:
  - Immediate **EMERGENCY (Red)** card with flashing **"Call 108 Now"** action.
  - Reason shown: Rule `RF-CHEST-01` fired.
  - Compare to General AI Chatbots: When given "mild chest burning and gas", general consumer LLMs under-triaged 52% of cardiac events. HealthPulse AI's deterministic rule engine guarantees patient safety.

---

### Part 2: The Everyday Rural Case (45 Seconds) — Persona: Karthik (19, M, Nanguneri)
- **Action**:
  1. Click **"Load Karthik"** from Demo Guide.
  2. Input: *"3 naala kaichal, udambu vali, thalai vali"* (fever for 3 days, body ache, headache).
  3. Danger questions answered "No".
- **Result**:
  - Result: **PHC_VISIT (Amber)** — *"Visit Nanguneri PHC within 24–48 hours"*.
  - Top 3 driving factors clearly displayed:
    1. Fever persisting for 3 days
    2. High transmission vector risk (Monsoon season)
    3. Moderate myalgia (body pain)
  - Public-care router shows **Nanguneri PHC** on interactive map with phone number and eSanjeevani option.
  - Generates 6-character Doctor Handoff Card QR code (`KAR19M`).

---

### Part 3: The Smart Report Reader & Longitudinal Timeline (45 Seconds) — Persona: Lakshmi (45, F, Manur)
- **Action**:
  1. Click **"Read My Report"** or select **"Load Lakshmi"**.
  2. See 3 longitudinal CBC reports from Jan, Apr, and Jul 2026.
  3. Extracted biomarkers displayed in simple editable confirmation table with Normal/Low/Critical badges.
  4. Open **Health Timeline**:
     - Visual Recharts interactive trend line showing Haemoglobin declining: **11.2 → 10.1 → 8.9 g/dL**.
     - System automatically fires `LAB-HB-02`: *"Haemoglobin dropped by 2.3 g/dL over 6 months."*
     - Auto-generates **3 Tailored Questions to Ask Your Doctor**.

---

### Part 4: The 30-Second Doctor Handoff (30 Seconds) — Role: PHC Medical Officer
- **Action**:
  1. Switch to Staff Login as `mo.nanguneri@healthpulse.demo` (Dr. Sundaram).
  2. Open **"Scan Doctor Card"** and enter code `KAR19M`.
- **Result**:
  - The Doctor Handoff Card displays the entire patient history in **30 seconds**:
    - Patient age band, duration, reported symptoms, danger signs answered, biomarker flags, and exact triage rationale.
  - 1-click **Download PDF** for physical clinic records.
  - Doctor feedback loop: 1-click button *"Urgency was appropriate / too high / too low"* feeds clinical calibration.

---

### Part 5: Community Pulse Early Warning Surveillance (45 Seconds)
- **Action**:
  1. Navigate to **Community Pulse** in the Medical Officer / DHO dashboard.
  2. Select **Nanguneri PHC** and syndrome **FEVER**.
- **Evidence**:
  - 52-week surveillance curve showing baseline $\mu=19.8, \sigma=3.5, \text{UCL}=24.1$.
  - In Week 30: Raw count jumps to 25 (above UCL), but EWMA is 21.0, avoiding false alarm!
  - In **Week 33**: EWMA crosses UCL to **27.3**, generating an automated outbreak alert.
  - Traditional $2\times\text{baseline}$ alert does not fire until **Week 34**. HealthPulse gives the PHC **1 full week earlier warning**!
  - Click **"Acknowledge Alert"** to record response note and audit trail entry.

---

### Part 6: Trust, Governance & DPDP Compliance (15 Seconds)
- **Action**:
  1. Open **Audit Trail**: View 100% append-only SHA-256 hash chain.
  2. Click **"Verify Chain"**: Instant cryptographic verification confirms all records are intact.
  3. Open **Compliance Hub**: Review DPDP Act 2023 checklist, 72-hour breach response drill countdown, and test **"Erase My Data"** (`DELETE /api/me`).
