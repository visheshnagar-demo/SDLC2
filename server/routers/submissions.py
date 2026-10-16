from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionRead,
    SubmissionListResponse,
    AttachmentCreate,
    AttachmentRead,
)
from server.services.submission_service import (
    create_submission,
    get_submission,
    list_submissions,
    add_attachment,
)

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionRead, status_code=status.HTTP_201_CREATED)
def submit_facultative_request(
    submission_in: SubmissionCreate,
    db: Session = Depends(get_db),
):
    """
    Submit a new Cyber or D&O facultative reinsurance request.
    Automatically triggers initial risk scoring and missing information scan.
    """
    return create_submission(db=db, sub_in=submission_in)


@router.get("/{submission_id}", response_model=SubmissionRead)
def get_submission_detail(
    submission_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve detailed submission profile including risk score breakdown,
    missing info flags, attachments, and underwriter decisions.
    """
    return get_submission(db=db, submission_id=submission_id)


@router.get("", response_model=SubmissionListResponse)
def list_carrier_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    risk_type: Optional[str] = Query(None, description="CYBER or D_AND_O"),
    status: Optional[str] = Query(None, description="SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED, etc."),
    carrier_id: Optional[str] = Query(None, description="Carrier identifier"),
    db: Session = Depends(get_db),
):
    """
    List facultative reinsurance submissions with optional filtering and pagination.
    """
    total, items = list_submissions(
        db=db,
        skip=skip,
        limit=limit,
        risk_type=risk_type,
        status=status,
        carrier_id=carrier_id,
    )
    return SubmissionListResponse(total=total, skip=skip, limit=limit, items=items)


@router.post("/{submission_id}/attachments", response_model=AttachmentRead, status_code=status.HTTP_201_CREATED)
def upload_submission_attachment(
    submission_id: str,
    attachment_in: AttachmentCreate,
    db: Session = Depends(get_db),
):
    """
    Attach documentation to a submission and refresh completeness flags.
    """
    return add_attachment(db=db, submission_id=submission_id, attachment_in=attachment_in)
