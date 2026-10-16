from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.decision import DecisionCreate, DecisionRead
from server.services.decision_service import (
    record_underwriting_decision,
    get_decisions_by_submission,
)

router = APIRouter(prefix="/underwriting/decisions", tags=["Decisions"])


@router.post("", response_model=DecisionRead, status_code=status.HTTP_201_CREATED)
def record_decision(
    decision_in: DecisionCreate,
    db: Session = Depends(get_db),
):
    """
    Record a formal Quote or Decline decision on a submission,
    updating the submission status and creating an audit record.
    """
    return record_underwriting_decision(db=db, decision_in=decision_in)


@router.get("/{submission_id}", response_model=List[DecisionRead])
def get_submission_decisions(
    submission_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve all decision records associated with a submission.
    """
    return get_decisions_by_submission(db=db, submission_id=submission_id)
