from typing import List
from backend.schemas import ZoneData, InterventionItem

def get_zone_interventions(zone: ZoneData) -> List[InterventionItem]:
    """
    Evaluates clinical & infrastructure rules over a typed Pydantic ZoneData object.
    Returns the top 3 matching interventions for the zone (Prompt 7 Part A).
    """
    candidates = []

    # Rule 1: High infrastructure gap and low ambulance coverage -> Mobile Medical Unit
    if zone.infrastructure_gap > 35.0 or zone.ambulance_coverage_pct < 60.0:
        candidates.append(InterventionItem(
            id=f"INT-MMU-{zone.id}",
            title="Mobile Medical Unit & Remote Immunization Outreach",
            category="Infrastructure & Outreach",
            target_block=zone.block,
            priority_rank=1,
            description="Deploy equipped Mobile Medical Unit on a bi-weekly schedule to remote hamlets.",
            rationale=f"Infrastructure gap is {zone.infrastructure_gap}% and ambulance coverage is {zone.ambulance_coverage_pct}%."
        ))

    # Rule 2: Low medicine stock -> Essential Drug Supply Kit & Buffer Stock
    if zone.medicine_stock_pct < 65.0:
        candidates.append(InterventionItem(
            id=f"INT-MED-{zone.id}",
            title="Essential Medicine Buffer & NCD Supply Kit",
            category="Supply Chain",
            target_block=zone.block,
            priority_rank=2,
            description="Dispatch supplemental emergency stock of antihypertensives, antidiabetics, and IV fluids.",
            rationale=f"Medicine stock is currently low at {zone.medicine_stock_pct}%."
        ))

    # Rule 3: High staffing shortage -> Tele-Consultation Node & Contract Nurse Posting
    if zone.staffing_shortage > 30.0:
        candidates.append(InterventionItem(
            id=f"INT-STAFF-{zone.id}",
            title="Tele-Health Specialist Node & Temporary Nursing Support",
            category="Human Resources",
            target_block=zone.block,
            priority_rank=3,
            description="Set up eSanjeevani teleconsultation tablet with auxiliary nurse midwife posting.",
            rationale=f"Clinical staffing shortage stands at {zone.staffing_shortage}%."
        ))

    # Rule 4: High maternal risk or child malnutrition
    if zone.maternal_high_risk_count >= 10 or zone.child_malnutrition_pct > 12.0:
        candidates.append(InterventionItem(
            id=f"INT-MCH-{zone.id}",
            title="Maternal & Child High-Risk Surveillance Drive",
            category="Maternal & Child Health",
            target_block=zone.block,
            priority_rank=4,
            description="Intensified home visits by ASHA workers with digital hemoglobinometer testing and nutrition kits.",
            rationale=f"{zone.maternal_high_risk_count} high-risk pregnancies tracked; child malnutrition at {zone.child_malnutrition_pct}%."
        ))

    # Rule 5: Baseline preventive outreach
    candidates.append(InterventionItem(
        id=f"INT-AWR-{zone.id}",
        title="Community Health Literacy & Preventive Awareness Outreach",
        category="Community Engagement",
        target_block=zone.block,
        priority_rank=5,
        description="Panchayat health camps on seasonal fever prevention, water boiling, and 108 emergency utilization.",
        rationale="General health literacy and syndromic awareness improvement."
    ))

    # Sort by priority rank and return the top 3
    candidates.sort(key=lambda x: x.priority_rank)
    return candidates[:3]
