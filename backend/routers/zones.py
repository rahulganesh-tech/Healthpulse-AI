import uuid
import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import RuralHealthZone, InterventionRequest, User
from backend.schemas import (
    ZoneData, ZoneDetailResponse, ResourceWhatIfRequest,
    ResourceWhatIfResponse, InterventionItem
)
from backend.services.recommendations import get_zone_interventions
from backend.services.prioritization import (
    classify_gap_category, compute_data_completeness, simulate_resource_allocation
)
from backend.services.auth import get_current_user, require_roles
from backend.services.audit import append_audit_log

router = APIRouter(prefix="/api", tags=["district_zones"])

def to_pydantic_zone(z: RuralHealthZone) -> ZoneData:
    return ZoneData(
        id=z.id,
        name=z.name,
        block=z.block,
        population=z.population,
        vulnerability_score=z.vulnerability_score,
        infrastructure_gap=z.infrastructure_gap,
        staffing_shortage=z.staffing_shortage,
        medicine_stock_pct=z.medicine_stock_pct,
        ambulance_coverage_pct=z.ambulance_coverage_pct,
        maternal_high_risk_count=z.maternal_high_risk_count,
        child_malnutrition_pct=z.child_malnutrition_pct,
        phc_id=z.phc_id
    )

@router.get("/overview")
def get_district_overview(db: Session = Depends(get_db)):
    zones = db.query(RuralHealthZone).all()
    p_zones = [to_pydantic_zone(z) for z in zones]

    scores = [z.vulnerability_score for z in p_zones]
    critical_count = sum(1 for s in scores if s >= 75.0)
    high_count = sum(1 for s in scores if 60.0 <= s < 75.0)
    moderate_count = sum(1 for s in scores if 45.0 <= s < 60.0)
    low_count = sum(1 for s in scores if s < 45.0)

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    return {
        "title": "HealthPulse AI — District View",
        "district": "Tirunelveli, Tamil Nadu",
        "pilotStatus": "Pilot planned",
        "dataProvenance": "Demo data (synthetic, calibrated to RHS/HMIS/NFHS-5 district figures)",
        "totalZones": len(zones),
        "districtVulnerabilityAverage": avg_score,
        "gapBreakdown": {
            "critical": critical_count,
            "high": high_count,
            "moderate": moderate_count,
            "low": low_count
        },
        "zones": [
            {
                "id": z.id,
                "name": z.name,
                "block": z.block,
                "score": z.vulnerability_score,
                "gapCategory": classify_gap_category(z.vulnerability_score),
                "completeness": compute_data_completeness(z),
                "interventions": [i.title for i in get_zone_interventions(z)]
            }
            for z in p_zones
        ]
    }

@router.get("/zones", response_model=List[ZoneData])
def list_zones(db: Session = Depends(get_db)):
    zones = db.query(RuralHealthZone).all()
    return [to_pydantic_zone(z) for z in zones]

@router.get("/zones/{zone_id}", response_model=ZoneDetailResponse)
def get_zone_detail(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(RuralHealthZone).filter(RuralHealthZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_id}' not found")

    p_zone = to_pydantic_zone(zone)
    interventions = get_zone_interventions(p_zone)
    category = classify_gap_category(p_zone.vulnerability_score)

    explanation = (
        f"{p_zone.name} is categorized as {category} vulnerability (Score {p_zone.vulnerability_score}). "
        f"Key drivers include an infrastructure gap of {p_zone.infrastructure_gap}%, "
        f"medicine stock availability of {p_zone.medicine_stock_pct}%, and "
        f"staffing shortage of {p_zone.staffing_shortage}%."
    )

    return ZoneDetailResponse(
        zone=p_zone,
        gap_category=category,
        top_interventions=interventions,
        explanation=explanation
    )

@router.post("/resource-prioritization", response_model=ResourceWhatIfResponse)
def run_resource_what_if(req: ResourceWhatIfRequest, db: Session = Depends(get_db)):
    zones = db.query(RuralHealthZone).all()
    p_zones = [to_pydantic_zone(z) for z in zones]
    return simulate_resource_allocation(p_zones, req)

@router.get("/intervention-requests")
def list_intervention_requests(db: Session = Depends(get_db)):
    reqs = db.query(InterventionRequest).order_by(InterventionRequest.created_at.desc()).all()
    return [{
        "id": r.id,
        "zoneId": r.zone_id,
        "interventionType": r.intervention_type,
        "status": r.status,
        "requestedBy": r.requested_by,
        "createdAt": r.created_at.isoformat(),
        "notes": r.notes
    } for r in reqs]

@router.post("/intervention-requests")
def create_intervention_request(
    zone_id: str = Body(..., embed=True),
    intervention_type: str = Body(..., embed=True),
    notes: str = Body("", embed=True),
    current_user: User = Depends(require_roles(["DHO", "ADMIN"])),
    db: Session = Depends(get_db)
):
    req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    new_req = InterventionRequest(
        id=req_id,
        zone_id=zone_id,
        intervention_type=intervention_type,
        status="Pending",
        requested_by=current_user.name,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        notes=notes
    )
    db.add(new_req)
    db.commit()

    append_audit_log(
        db,
        actor=current_user.name,
        role=current_user.role,
        action="Intervention Request Created",
        detail=f"Requested {intervention_type} for zone {zone_id}: {notes}"
    )

    return {
        "status": "success",
        "id": req_id,
        "message": f"Intervention request {req_id} submitted for review."
    }
