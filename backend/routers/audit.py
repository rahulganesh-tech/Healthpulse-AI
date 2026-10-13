from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import AuditLog, User
from backend.schemas import AuditLogSchema, AuditVerifyResponse
from backend.services.audit import verify_audit_chain
from backend.services.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/audit", tags=["audit"])

@router.get("", response_model=List[AuditLogSchema])
def get_audit_trail(current_user: User = Depends(require_roles(["AUDITOR", "ADMIN", "CLIN", "DHO"])), db: Session = Depends(get_db)):
    entries = db.query(AuditLog).order_by(AuditLog.id.desc()).all()
    return [
        AuditLogSchema(
            id=e.id,
            ts=e.ts.isoformat() if hasattr(e.ts, "isoformat") else str(e.ts),
            actor=e.actor,
            role=e.role,
            action=e.action,
            detail=e.detail,
            prev_hash=e.prev_hash,
            hash=e.hash
        ) for e in entries
    ]

@router.get("/verify", response_model=AuditVerifyResponse)
def run_audit_verification(current_user: User = Depends(require_roles(["AUDITOR", "ADMIN", "CLIN", "DHO"])), db: Session = Depends(get_db)):
    res = verify_audit_chain(db)
    return AuditVerifyResponse(**res)
