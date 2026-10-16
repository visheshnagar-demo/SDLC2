from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    ReinsuranceSubmissionCreate,
    ReinsuranceSubmissionCreateResponse,
    SubmissionQueueItemResponse,
)
from server.services.submission_service import SubmissionService

router = APIRouter(prefix="/api/v1/reinsurance-requests", tags=["Reinsurance Requests"])


@router.post(
    "",
    response_model=ReinsuranceSubmissionCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create facultative reinsurance submission",
)
def create_reinsurance_request(
    payload: ReinsuranceSubmissionCreate,
    db: Session = Depends(get_db),
):
    submission = SubmissionService.create_submission(db, payload)
    return ReinsuranceSubmissionCreateResponse(
        id=submission.id,
        submission_reference=submission.submission_reference,
        status=submission.status,
        risk_category=submission.risk_category,
        risk_score=submission.risk_score,
        priority=submission.priority,
        has_missing_info=submission.has_missing_info,
        missing_flags_count=len(
            [f for f in submission.missing_flags if not f.is_resolved]
        ),
        created_at=submission.created_at,
    )


@router.get(
    "/{submission_id}",
    response_model=SubmissionQueueItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Get reinsurance submission details by ID",
)
def get_reinsurance_request(
    submission_id: str,
    db: Session = Depends(get_db),
):
    submission = SubmissionService.get_submission_by_id(db, submission_id)
    return submission
