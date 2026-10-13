import datetime
import hashlib
import yaml
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import RulesVersion, User
from backend.services.auth import get_current_user, require_roles
from backend.services.audit import append_audit_log

router = APIRouter(prefix="/api/rules", tags=["rules"])

@router.get("")
def get_rules_versions(db: Session = Depends(get_db)):
    versions = db.query(RulesVersion).order_by(RulesVersion.approved_at.desc().nullslast()).all()
    return [{
        "version": v.version,
        "sha256": v.sha256,
        "proposedBy": v.proposed_by,
        "approvedBy": v.approved_by,
        "approvedAt": v.approved_at.isoformat() if v.approved_at else None,
        "active": v.active,
        "yamlText": v.yaml_text
    } for v in versions]

@router.post("")
def propose_rules_version(
    version: str = Body(..., embed=True),
    yaml_text: str = Body(..., embed=True),
    current_user: User = Depends(require_roles(["CLIN", "ADMIN"])),
    db: Session = Depends(get_db)
):
    try:
        yaml.safe_load(yaml_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid YAML syntax: {str(e)}")

    sha = hashlib.sha256(yaml_text.encode("utf-8")).hexdigest()
    rv = RulesVersion(
        version=version,
        yaml_text=yaml_text,
        sha256=sha,
        proposed_by=current_user.name,
        active=False
    )
    db.add(rv)
    db.commit()

    append_audit_log(
        db,
        actor=current_user.name,
        role=current_user.role,
        action="Rules Version Proposed",
        detail=f"Proposed rule file {version} with SHA-256 {sha[:12]}..."
    )

    return {"status": "success", "version": version, "sha256": sha}

@router.post("/{version}/approve")
def approve_rules_version(
    version: str,
    current_user: User = Depends(require_roles(["CLIN"])),
    db: Session = Depends(get_db)
):
    rv = db.query(RulesVersion).filter(RulesVersion.version == version).first()
    if not rv:
        raise HTTPException(status_code=404, detail="Rules version not found")

    # Set others to inactive
    db.query(RulesVersion).update({RulesVersion.active: False})
    rv.active = True
    rv.approved_by = current_user.name
    rv.approved_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    append_audit_log(
        db,
        actor=current_user.name,
        role=current_user.role,
        action="Rules Version Approved",
        detail=f"Clinical Reviewer {current_user.name} approved rule set {version}"
    )

    return {"status": "success", "message": f"Version {version} approved and marked active."}
