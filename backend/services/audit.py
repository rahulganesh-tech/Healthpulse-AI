import hashlib
import datetime
from sqlalchemy.orm import Session
from backend.models import AuditLog

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def format_canonical_ts(ts) -> str:
    if isinstance(ts, str):
        return ts
    if hasattr(ts, "strftime"):
        # Format as UTC string up to seconds
        return ts.strftime("%Y-%m-%dT%H:%M:%SZ")
    return str(ts)

def compute_entry_hash(ts_str: str, actor: str, role: str, action: str, detail: str, prev_hash: str) -> str:
    raw = f"{ts_str}|{actor}|{role}|{action}|{detail}|{prev_hash}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def append_audit_log(db: Session, actor: str, role: str, action: str, detail: str) -> AuditLog:
    # Get last entry for prev_hash
    last_entry = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    prev_hash = last_entry.hash if last_entry else GENESIS_HASH

    now = datetime.datetime.now(datetime.timezone.utc)
    ts_str = format_canonical_ts(now)
    entry_hash = compute_entry_hash(ts_str, actor, role, action, detail, prev_hash)

    log_entry = AuditLog(
        ts=now,
        actor=actor,
        role=role,
        action=action,
        detail=detail,
        prev_hash=prev_hash,
        hash=entry_hash
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

def verify_audit_chain(db: Session) -> dict:
    entries = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    if not entries:
        return {"intact": True, "total_entries": 0, "first_broken_entry": None, "message": "Audit chain empty but intact"}

    expected_prev = GENESIS_HASH
    for entry in entries:
        ts_str = format_canonical_ts(entry.ts)
        # Check previous hash pointer
        if entry.prev_hash != expected_prev:
            return {
                "intact": False,
                "total_entries": len(entries),
                "first_broken_entry": entry.id,
                "message": f"Hash chain broken at entry #{entry.id}: prev_hash mismatch"
            }

        recalculated = compute_entry_hash(ts_str, entry.actor, entry.role, entry.action, entry.detail, entry.prev_hash)
        if recalculated != entry.hash:
            return {
                "intact": False,
                "total_entries": len(entries),
                "first_broken_entry": entry.id,
                "message": f"Tampering detected at entry #{entry.id}: computed hash does not match stored hash"
            }

        expected_prev = entry.hash

    return {
        "intact": True,
        "total_entries": len(entries),
        "first_broken_entry": None,
        "message": "Audit chain fully verified: all cryptographic hashes intact"
    }
