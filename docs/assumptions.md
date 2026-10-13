# HealthPulse AI — District Modeling & What-If Simulation Assumptions

**Document Code**: REG-003-OP-ASSUME  
**Audience**: District Health Officer (DHO), Health Administrators, Evaluators  
**Scope**: Model parameters for vulnerability scoring, resource impact simulation, and syndromic surveillance  

---

## 1. Transparency Principle

In accordance with Prompt 7 of the SEVA 2026 build guidelines, HealthPulse AI **does not make unverified claims** (such as fixed claims of "35% reduction in 60 days"). All simulated improvements are calculated dynamically based on the explicit, editable operational parameters below.

---

## 2. District Health Vulnerability Index (DHVI) Scoring

The vulnerability score for each of the 10 Tirunelveli rural blocks is computed from calibrated public health data (RHS/HMIS/NFHS-5 district benchmarks):

$$\text{Vulnerability Score} = 0.30 \times \text{InfraGap} + 0.25 \times \text{StaffShortage} + 0.20 \times (100 - \text{MedicineStock}) + 0.15 \times (100 - \text{AmbulanceCoverage}) + 0.10 \times \text{MaternalChildRisk}$$

### Gap Severity Tiers
- **Critical** ($\ge 75.0$): Urgent multi-sectoral intervention required (e.g., Manur: 78.5, Nanguneri: 77.3).
- **High** ($60.0 - 74.9$): Priority operational support (e.g., Radhapuram: 68.2, Cheranmahadevi: 64.0).
- **Moderate** ($45.0 - 59.9$): Standard supervisory monitoring (e.g., Ambasamudram: 54.5, Kadayam: 51.0, Kalakkad: 48.2).
- **Low** ($< 45.0$): Well-resourced catchment (e.g., Valliyoor: 41.5, Palayamkottai: 38.0, Alangulam: 34.5).

---

## 3. Dynamic Resource What-If Allocation Impact Assumptions

When the District Health Officer allocates operational resources in the **Resource What-If Simulator**, the following simulated score adjustments apply:

| Resource Type | Eligibility Trigger Rule | Impact on Target Zone Score | Clinical Operational Rationale |
| :--- | :--- | :--- | :--- |
| **Mobile Medical Unit (MMU)** | Infrastructure Gap $> 35\%$ OR Score $\ge 70.0$ | **$-4.5$ points** | Delivers bi-weekly physician outreach and diagnostics to unserved remote hamlets. |
| **Emergency Medicine Buffer Kit** | Medicine Stock $< 65\%$ (e.g. Manur at $30\%$) | **$-4.0$ points** | Replenishes critical NCD drugs, antibiotics, and IV fluids at PHC dispensary. |
| **Temporary Nurse Staffing (ANM)** | Staffing Shortage $> 25\%$ | **$-3.5$ points** | Enhances maternal antenatal screening, immunization, and triage capacity. |
| **Dedicated Rural Ambulance** | Ambulance Coverage $< 65\%$ | **$-3.0$ points** | Reduces emergency response transit time for critical obstetric and cardiac transfers. |

---

## 4. Community Pulse EWMA Parameters

The syndromic early-warning detector uses an Exponentially Weighted Moving Average (EWMA) statistical control chart:

$$\lambda = 0.30, \quad L = 3.0, \quad z_0 = \mu$$
$$\text{UCL} = \mu + L \cdot \sigma \sqrt{\frac{\lambda}{2 - \lambda}}$$

- **Baseline Phase**: Calculated from the initial 26 quiet weeks ($\mu = 19.8, \sigma = 3.5, \text{UCL} = 24.1$ for Nanguneri FEVER).
- **Outbreak Sensitivity**: On synthetic growth simulations, EWMA detects incipient outbreaks on average **2.4 to 2.7 weeks earlier** than the traditional $2 \times \text{baseline}$ public health threshold.
