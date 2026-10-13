import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import User
from backend.schemas import UserSchema
from backend.services.auth import get_current_user, require_roles, hash_password
from backend.services.audit import append_audit_log

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("", response_model=List[UserSchema])
def list_users(current_user: User = Depends(require_roles(["ADMIN"])), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [UserSchema(
        id=u.id,
        phone_or_email=u.phone_or_email,
        name=u.name,
        role=u.role,
        phc_id=u.phc_id,
        active=u.active
    ) for u in users]

@router.post("", response_model=UserSchema)
def create_user(
    phone_or_email: str = Body(..., embed=True),
    name: str = Body(..., embed=True),
    role: str = Body(..., embed=True),
    phc_id: Optional[str] = Body(None, embed=True),
    password: str = Body("demo123", embed=True),
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.phone_or_email == phone_or_email.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this phone/email already exists")

    uid = f"USR-{uuid.uuid4().hex[:6].upper()}"
    new_user = User(
        id=uid,
        phone_or_email=phone_or_email.strip(),
        name=name.strip(),
        role=role.strip().upper(),
        phc_id=phc_id,
        password_hash=hash_password(password),
        active=True
    )
    db.add(new_user)
    db.commit()

    append_audit_log(
        db,
        actor=current_user.name,
        role=current_user.role,
        action="User Created",
        detail=f"Created {role} user {name} ({phone_or_email})"
    )

    return UserSchema(
        id=new_user.id,
        phone_or_email=new_user.phone_or_email,
        name=new_user.name,
        role=new_user.role,
        phc_id=new_user.phc_id,
        active=new_user.active
    )

@router.patch("/{user_id}/status")
def toggle_user_status(
    user_id: str,
    active: bool = Body(..., embed=True),
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.active = active
    db.commit()

    append_audit_log(
        db,
        actor=current_user.name,
        role=current_user.role,
        action="User Status Updated",
        detail=f"Set user {user.name} active state to {active}"
    )

    return {"status": "success", "userId": user_id, "active": active}
