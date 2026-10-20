from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Quote, RiskExposure, PolicyBinder

router = APIRouter(prefix="/api/v1/health", tags=["health"])


@router.get("")
def get_health(db: Session = Depends(get_db)):
    quotes_count = db.query(Quote).count()
    risks_count = db.query(RiskExposure).count()
    binders_count = db.query(PolicyBinder).count()

    return {
        "status": "UP",
        "service": "genre-qtb-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "datasets": {
            "quotes": quotes_count,
            "risks": risks_count,
            "binders": binders_count,
        },
    }
