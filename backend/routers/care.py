import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import PHC, Check, Report, LabValue, Consent
from backend.schemas import PHCSchema

router = APIRouter(prefix="/api", tags=["care"])

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

@router.get("/care/nearest", response_model=List[PHCSchema])
def get_nearest_phcs(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    block: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PHC)
    if block:
        query = query.filter(PHC.block.ilike(f"%{block}%"))

    phcs = query.all()
    if not phcs:
        return []

    phc_list = [PHCSchema(
        id=p.id,
        name=p.name,
        block=p.block,
        district=p.district,
        lat=p.lat,
        lng=p.lng,
        phone=p.phone,
        is_aam=p.is_aam,
        zone_id=p.zone_id
    ) for p in phcs]

    if lat is not None and lng is not None:
        phc_list.sort(key=lambda p: haversine_km(lat, lng, p.lat, p.lng))

    return phc_list

@router.delete("/me")
def erase_patient_data(owner_token: str = Query(...), db: Session = Depends(get_db)):
    """
    DPDP Act 2023 Right to Erasure:
    Deletes all personal checks, reports, and lab values associated with owner_token.
    Anonymous Community Pulse aggregate counts are preserved.
    """
    if not owner_token:
        raise HTTPException(status_code=400, detail="owner_token required")

    deleted_checks = db.query(Check).filter(Check.owner_token == owner_token).delete()
    deleted_labs = db.query(LabValue).filter(LabValue.owner_token == owner_token).delete()
    deleted_reports = db.query(Report).filter(Report.owner_token == owner_token).delete()
    deleted_consent = db.query(Consent).filter(Consent.owner_token == owner_token).delete()

    db.commit()

    return {
        "status": "success",
        "message": f"All data for token {owner_token[:8]}... erased pursuant to DPDP Act 2023.",
        "records_erased": {
            "checks": deleted_checks,
            "reports": deleted_reports,
            "lab_values": deleted_labs,
            "consent": deleted_consent
        }
    }
