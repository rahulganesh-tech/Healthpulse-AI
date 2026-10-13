from typing import List, Dict, Any
from backend.schemas import (
    ZoneData, ResourceWhatIfRequest, ResourceWhatIfResponse, ZoneImpact
)

def classify_gap_category(score: float) -> str:
    if score >= 75.0:
        return "Critical"
    elif score >= 60.0:
        return "High"
    elif score >= 45.0:
        return "Moderate"
    else:
        return "Low"

def compute_data_completeness(zone: ZoneData) -> float:
    """
    Computes data completeness percentage dynamically from field validity,
    removing any hard-coded zone checks.
    """
    fields = [
        zone.population > 0,
        zone.vulnerability_score is not None,
        zone.infrastructure_gap is not None,
        zone.staffing_shortage is not None,
        zone.medicine_stock_pct is not None,
        zone.ambulance_coverage_pct is not None,
        zone.maternal_high_risk_count is not None,
        zone.child_malnutrition_pct is not None
    ]
    return round((sum(fields) / len(fields)) * 100.0, 1)

def simulate_resource_allocation(zones: List[ZoneData], resources: ResourceWhatIfRequest) -> ResourceWhatIfResponse:
    """
    Simulates dynamic allocation of district resources according to need-based rules
    defined in docs/assumptions.md.
    """
    available_mmus = resources.mobile_medical_units
    available_meds = resources.medicine_kits
    available_nurses = resources.temporary_nurses
    available_amb = resources.emergency_ambulances

    # Sort zones by vulnerability score descending for prioritized allocation
    sorted_zones = sorted(zones, key=lambda z: z.vulnerability_score, reverse=True)
    zone_impacts = []

    for z in sorted_zones:
        allocations = []
        reduction = 0.0

        # Allocation 1: Mobile Medical Unit to zones with highest infrastructure gap
        if available_mmus > 0 and (z.infrastructure_gap > 35.0 or z.vulnerability_score >= 70.0):
            allocations.append("Mobile Medical Unit (1 unit)")
            reduction += 4.5
            available_mmus -= 1

        # Allocation 2: Medicine kit to zones with medicine stock < 65% (e.g. Manur with 30%)
        if available_meds > 0 and z.medicine_stock_pct < 65.0:
            allocations.append("Emergency Medicine Buffer Kit")
            reduction += 4.0
            available_meds -= 1

        # Allocation 3: Temporary nurse to high staffing shortage zones
        if available_nurses > 0 and z.staffing_shortage > 25.0:
            allocations.append("Temporary Nurse Staffing (ANM)")
            reduction += 3.5
            available_nurses -= 1

        # Allocation 4: Emergency ambulance to zones with lowest ambulance coverage
        if available_amb > 0 and z.ambulance_coverage_pct < 65.0:
            allocations.append("Dedicated Rural Ambulance")
            reduction += 3.0
            available_amb -= 1

        simulated_score = max(round(z.vulnerability_score - reduction, 1), 10.0)

        zone_impacts.append(ZoneImpact(
            zone_id=z.id,
            zone_name=z.name,
            original_score=z.vulnerability_score,
            simulated_score=simulated_score,
            score_reduction=round(reduction, 1),
            allocated_resources=allocations
        ))

    # Restore original order by ID
    zone_impacts.sort(key=lambda x: x.zone_id)

    avg_before = round(sum(z.vulnerability_score for z in zones) / len(zones), 1) if zones else 0.0
    avg_after = round(sum(zi.simulated_score for zi in zone_impacts) / len(zone_impacts), 1) if zone_impacts else 0.0
    net_improvement = round(avg_before - avg_after, 1)

    return ResourceWhatIfResponse(
        assumptions_reference="docs/assumptions.md",
        zone_impacts=zone_impacts,
        district_average_before=avg_before,
        district_average_after=avg_after,
        net_improvement=net_improvement
    )
