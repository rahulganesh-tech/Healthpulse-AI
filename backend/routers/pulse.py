from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.database import get_db
from backend.models import PulseCount, PulseAlert, PHC, User
from backend.schemas import (
    PulsePHCDetail, SyndromeCount, PulseAlertSchema
)
from backend.pulse.ewma import calculate_ewma_series, evaluate_pulse_alerts_for_phc
from backend.services.auth import get_current_user, require_roles
from backend.services.audit import append_audit_log

router = APIRouter(prefix="/api/pulse", tags=["pulse"])

@router.get("", response_model=PulsePHCDetail)
def get_pulse_data(
    phc_id: Optional[str] = Query(None),
    syndrome: str = Query("FEVER"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Community Pulse syndromic EWMA surveillance:
    MO sees own PHC only; DHO/ADMIN/AUDITOR can view all PHCs.
    """
    target_phc_id = phc_id
    if current_user.role == "MO":
        target_phc_id = current_user.phc_id or phc_id

    if not target_phc_id:
        target_phc_id = "PHC-02"  # Default Nanguneri PHC

    phc = db.query(PHC).filter(PHC.id == target_phc_id).first()
    phc_name = phc.name if phc else "PHC"

    records = db.query(PulseCount).filter(
        PulseCount.phc_id == target_phc_id,
        PulseCount.syndrome == syndrome
    ).order_by(PulseCount.week_start.asc()).all()

    if not records:
        return PulsePHCDetail(
            phc_id=target_phc_id,
            phc_name=phc_name,
            syndrome=syndrome,
            history=[],
            baseline_mean=0.0,
            baseline_sd=0.0,
            current_ucl=0.0,
            current_ewma=0.0
        )

    raw_counts = [r.count for r in records]
    stats = calculate_ewma_series(raw_counts)

    history = []
    for idx, r in enumerate(records):
        count_display = str(r.count) if r.count >= 10 else "<10"
        history.append(SyndromeCount(
            week_start=r.week_start,
            count=count_display,
            raw_count=r.count,
            ewma=stats["ewma"][idx] if idx < len(stats["ewma"]) else 0.0,
            ucl=stats["ucl"]
        ))

    # Active alert if any
    alert = db.query(PulseAlert).filter(
        PulseAlert.phc_id == target_phc_id,
        PulseAlert.syndrome == syndrome
    ).order_by(PulseAlert.created_at.desc()).first()

    alert_schema = None
    if alert:
        alert_schema = PulseAlertSchema(
            id=alert.id,
            phc_id=alert.phc_id,
            phc_name=phc_name,
            syndrome=alert.syndrome,
            week_start=alert.week_start,
            ewma=alert.ewma,
            ucl=alert.ucl,
            baseline_mean=alert.baseline_mean,
            baseline_sd=alert.baseline_sd,
            status=alert.status,
            acknowledged_by=alert.acknowledged_by,
            note=alert.note
        )

    return PulsePHCDetail(
        phc_id=target_phc_id,
        phc_name=phc_name,
        syndrome=syndrome,
        history=history,
        active_alert=alert_schema,
        baseline_mean=stats["mu"],
        baseline_sd=stats["sigma"],
        current_ucl=stats["ucl"],
        current_ewma=stats["ewma"][-1] if stats["ewma"] else 0.0
    )

@router.get("/alerts", response_model=List[PulseAlertSchema])
def get_pulse_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(PulseAlert)
    if current_user.role == "MO" and current_user.phc_id:
        query = query.filter(PulseAlert.phc_id == current_user.phc_id)

    alerts = query.order_by(PulseAlert.created_at.desc()).all()
    out = []
    for a in alerts:
        phc = db.query(PHC).filter(PHC.id == a.phc_id).first()
        out.append(PulseAlertSchema(
            id=a.id,
            phc_id=a.phc_id,
            phc_name=phc.name if phc else a.phc_id,
            syndrome=a.syndrome,
            week_start=a.week_start,
            ewma=a.ewma,
            ucl=a.ucl,
            baseline_mean=a.baseline_mean,
            baseline_sd=a.baseline_sd,
            status=a.status,
            acknowledged_by=a.acknowledged_by,
            note=a.note
        ))
    return out

@router.post("/alerts/{alert_id}/ack")
def acknowledge_alert(
    alert_id: str,
    note: str = Body(..., embed=True),
    current_user: User = Depends(require_roles(["MO", "DHO", "ADMIN"])),
    db: Session = Depends(get_db)
):
    alert = db.query(PulseAlert).filter(PulseAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if current_user.role == "MO" and current_user.phc_id and alert.phc_id != current_user.phc_id:
        raise HTTPException(status_code=403, detail="Your role (MO) cannot acknowledge alerts for another PHC")

    alert.status = "Acknowledged"
    alert.acknowledged_by = current_user.name
    alert.note = note
    db.commit()

    append_audit_log(
        db,
        actor=current_user.name,
        role=current_user.role,
        action="Pulse Alert Acknowledged",
        detail=f"Acknowledged alert {alert_id} ({alert.syndrome} at {alert.phc_id}): {note}"
    )

    return {
        "status": "success",
        "message": f"Alert {alert_id} acknowledged by {current_user.name}.",
        "alert_id": alert_id
    }

@router.post("/run")
def trigger_pulse_run(current_user: User = Depends(require_roles(["DHO", "ADMIN", "MO"])), db: Session = Depends(get_db)):
    """Run now trigger for demo presentations (Prompt 7 Part B)"""
    phcs = db.query(PHC).all()
    alerts_created = 0
    for p in phcs:
        for syn in ["FEVER", "FEVER_BLEED_RASH", "DIARRHOEA_VOMIT", "COUGH_BREATH", "HEAT"]:
            res = evaluate_pulse_alerts_for_phc(db, p.id, syn)
            if res:
                alerts_created += 1

    append_audit_log(
        db,
        actor=current_user.name,
        role=current_user.role,
        action="Community Pulse Manual Run",
        detail=f"Triggered syndromic surveillance evaluation across {len(phcs)} PHCs; {alerts_created} new alerts."
    )

    return {
        "status": "success",
        "message": f"Community Pulse evaluation completed. {alerts_created} alerts processed."
    }
