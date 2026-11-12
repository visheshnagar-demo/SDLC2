from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionListResponse,
    MissingInfoFlagResponse,
)
from server.schemas.decision import DecisionCreate, DecisionResponse, DeclineReason
from server.services.submission_service import SubmissionService
from server.services.decision_service import DecisionService

router = APIRouter(prefix="/api/v1/submissions", tags=["Submissions"])


@router.get(
    "/decline-reasons",
    response_model=List[DeclineReason],
    summary="Get master decline reasons catalogue (alias)",
)
def get_decline_reasons_alias():
    return DecisionService.get_decline_reasons()


@router.post(
    "",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and ingest facultative reinsurance request",
)
def create_submission(payload: SubmissionCreate, db: Session = Depends(get_db)):
    submission = SubmissionService.create_submission(db=db, data=payload)
    return submission


@router.get(
    "",
    response_model=SubmissionListResponse,
    summary="List submissions with filtering and pagination",
)
def list_submissions(
    risk_type: Optional[str] = Query(
        None, description="Filter by risk category (CYBER, DO)"
    ),
    status: Optional[str] = Query(
        None, description="Filter by status (PENDING, QUOTED, DECLINED)"
    ),
    min_score: Optional[float] = Query(
        None, description="Minimum risk score threshold"
    ),
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    items, total = SubmissionService.list_submissions(
        db=db,
        risk_type=risk_type,
        status_filter=status,
        min_score=min_score,
        skip=skip,
        limit=limit,
    )
    return SubmissionListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get(
    "/{submission_id}",
    response_model=SubmissionResponse,
    summary="Retrieve full detail of a submission",
)
def get_submission(submission_id: str, db: Session = Depends(get_db)):
    submission = SubmissionService.get_submission(db=db, submission_id=submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission with id {submission_id} not found",
        )
    return submission


@router.get(
    "/{submission_id}/flags",
    response_model=List[MissingInfoFlagResponse],
    summary="Retrieve missing information flags for a submission",
)
def get_submission_flags(submission_id: str, db: Session = Depends(get_db)):
    return SubmissionService.get_flags(db=db, submission_id=submission_id)


@router.post(
    "/{submission_id}/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Quote or Decline decision",
)
def record_decision(
    submission_id: str, payload: DecisionCreate, db: Session = Depends(get_db)
):
    decision = DecisionService.record_decision(
        db=db, submission_id=submission_id, data=payload
    )
    return decision
