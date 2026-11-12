from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.decision import DeclineReason, DecisionCreate, DecisionResponse
from server.services.decision_service import DecisionService

router = APIRouter(prefix="/api/v1/underwriting", tags=["Underwriting"])


@router.get(
    "/reasons",
    response_model=List[DeclineReason],
    summary="Get master decline reasons catalogue",
)
def get_decline_reasons():
    return DecisionService.get_decline_reasons()


@router.get(
    "/decline-reasons",
    response_model=List[DeclineReason],
    summary="Get master decline reasons catalogue (alias)",
)
def get_decline_reasons_explicit():
    return DecisionService.get_decline_reasons()


@router.post(
    "/submissions/{submission_id}/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Quote or Decline decision via underwriting namespace",
)
def record_decision_underwriting(
    submission_id: str, payload: DecisionCreate, db: Session = Depends(get_db)
):
    decision = DecisionService.record_decision(
        db=db, submission_id=submission_id, data=payload
    )
    return decision
