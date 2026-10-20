from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.risk_score import RiskScoreRequest, RiskScoreResponse
from server.services.scoring_service import calculate_risk_score
from server.models.risk_score import RiskScore
from server.dependencies.auth import get_current_user, require_roles
from server.models.user import User

router = APIRouter(prefix="/api/v1/submissions", tags=["Risk Scoring"])


@router.post("/{id}/score", response_model=RiskScoreResponse)
def trigger_risk_score_calculation(
    id: str,
    score_req: Optional[RiskScoreRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["RE_UNDERWRITER", "UNDERWRITING_MANAGER", "SYSTEM"])
    ),
):
    factors_input = score_req.factors_input if score_req else None
    notes = score_req.notes if score_req else None
    return calculate_risk_score(
        db=db,
        submission_id=id,
        factors_input=factors_input,
        notes=notes,
        actor=current_user,
    )


@router.get("/{id}/score", response_model=RiskScoreResponse)
def get_latest_risk_score(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    score = (
        db.query(RiskScore)
        .filter(RiskScore.submission_id == id)
        .order_by(RiskScore.evaluated_at.desc())
        .first()
    )
    if not score:
        # Calculate on the fly if not yet scored
        return calculate_risk_score(db=db, submission_id=id, actor=current_user)
    return score
