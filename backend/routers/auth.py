import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import LoginRequest, TokenResponse, UserSchema
from backend.services.auth import verify_password, create_access_token, get_current_user
from backend.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_or_email == req.phone_or_email.strip()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    now = datetime.datetime.now(datetime.timezone.utc)
    if user.locked_until and user.locked_until > now:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account locked due to 5 failed attempts. Please contact Administrator.")

    # Check password or OTP
    pwd_valid = verify_password(req.password, user.password_hash)
    otp_valid = (req.otp and req.otp.strip() == settings.OTP_DEMO_CODE) or (req.password == settings.OTP_DEMO_CODE)

    if not pwd_valid and not otp_valid:
        user.failed_logins += 1
        if user.failed_logins >= 5:
            user.locked_until = now + datetime.timedelta(minutes=30)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Reset failed logins
    user.failed_logins = 0
    user.locked_until = None
    db.commit()

    token = create_access_token({"sub": user.id, "role": user.role, "phc_id": user.phc_id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        role=user.role,
        phc_id=user.phc_id
    )

@router.post("/otp", response_model=TokenResponse)
def login_with_otp(req: LoginRequest, db: Session = Depends(get_db)):
    return login(req, db)

@router.get("/me", response_model=UserSchema)
def get_me(current_user: User = Depends(get_current_user)):
    return UserSchema(
        id=current_user.id,
        phone_or_email=current_user.phone_or_email,
        name=current_user.name,
        role=current_user.role,
        phc_id=current_user.phc_id,
        active=current_user.active
    )
