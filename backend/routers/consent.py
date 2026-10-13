import uuid
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Consent
from backend.schemas import ConsentRequest, ConsentResponse

router = APIRouter(prefix="/api/consent", tags=["consent"])

@router.post("", response_model=ConsentResponse)
def give_consent(req: ConsentRequest, db: Session = Depends(get_db)):
    owner_token = f"USR-{uuid.uuid4().hex}"
    purposes = list(req.purposes)
    if req.save_timeline:
        purposes.append("save_timeline")

    new_consent = Consent(
        id=f"CNS-{uuid.uuid4().hex[:8].upper()}",
        owner_token=owner_token,
        language=req.language,
        purposes=purposes,
        given_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(new_consent)
    db.commit()

    return ConsentResponse(
        owner_token=owner_token,
        message="Consent granted under Digital Personal Data Protection (DPDP) Act 2023."
    )
