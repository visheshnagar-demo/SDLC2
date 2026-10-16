from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import (
    QuoteDecisionRequest,
    DeclineDecisionRequest,
    UnderwritingDecisionResponse,
)
from server.services.decision_service import (
    record_quote_decision,
    record_decline_decision,
    get_decision_by_submission,
)

router = APIRouter(
    prefix="/api/v1/decisions", tags=["Underwriting Decisions (Quote & Decline)"]
)


@router.post(
    "/quote",
    response_model=UnderwritingDecisionResponse,
    status_code=status.HTTP_200_OK,
)
def quote_submission(payload: QuoteDecisionRequest, db: Session = Depends(get_db)):
    decision = record_quote_decision(db, payload)
    return decision


@router.post(
    "/decline",
    response_model=UnderwritingDecisionResponse,
    status_code=status.HTTP_200_OK,
)
def decline_submission(payload: DeclineDecisionRequest, db: Session = Depends(get_db)):
    decision = record_decline_decision(db, payload)
    return decision


@router.get("/{submission_id}", response_model=UnderwritingDecisionResponse)
def get_submission_decision(submission_id: str, db: Session = Depends(get_db)):
    decision = get_decision_by_submission(db, submission_id)
    if not decision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No decision found for submission ID '{submission_id}'.",
        )
    return decision
