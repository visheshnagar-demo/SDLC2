from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.routers.auth_router import get_current_user
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionResponse,
    SubmissionCreatedResponse,
    AttachmentCreate,
    AttachmentResponse,
)
from server.schemas.underwriting import DeclineReason
from server.services.submission_service import (
    create_submission,
    add_attachment_to_submission,
    get_submission_by_id,
    list_carrier_submissions,
)
from server.services.underwriting_service import get_decline_reasons

router = APIRouter(prefix="/submissions", tags=["Carrier Submissions"])


@router.get("/decline-reasons", response_model=List[DeclineReason])
def list_submission_decline_reasons():
    """Returns standardized decline reason codes."""
    return get_decline_reasons()


@router.post(
    "", response_model=SubmissionCreatedResponse, status_code=status.HTTP_201_CREATED
)
def submit_facultative_request(
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits a new Cyber or D&O facultative reinsurance request.
    Executes algorithmic risk scoring and missing information detection automatically.
    """
    try:
        submission = create_submission(
            db=db,
            payload=payload,
            carrier_id=current_user.id if current_user else None,
            carrier_name=current_user.company_name or current_user.full_name
            if current_user
            else payload.carrier_name,
        )
        db.commit()
        db.refresh(submission)
        return submission
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process reinsurance submission: {str(e)}",
        )


@router.get("", response_model=List[SubmissionResponse])
def get_carrier_submissions(
    risk_type: Optional[str] = Query(None, description="Filter by CYBER or D_AND_O"),
    submission_status: Optional[str] = Query(
        None, alias="status", description="Filter by status"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lists reinsurance requests submitted by the current carrier or all submissions if admin/underwriter.
    """
    carrier_id_filter = (
        current_user.id if (current_user and current_user.role == "carrier") else None
    )
    return list_carrier_submissions(
        db=db,
        carrier_id=carrier_id_filter,
        risk_type=risk_type,
        status=submission_status,
        skip=skip,
        limit=limit,
    )


@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission_details(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves full details of a specific reinsurance submission by ID.
    """
    submission = get_submission_by_id(db, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{submission_id}' not found",
        )
    return submission


@router.post(
    "/{submission_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_submission_attachment(
    submission_id: str,
    payload: AttachmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Uploads supporting risk documents (e.g. Cyber Assessment, Loss Runs, Board Audit).
    Re-evaluates missing documentation flags automatically.
    """
    try:
        attachment, _ = add_attachment_to_submission(
            db=db,
            submission_id=submission_id,
            payload=payload,
            actor_id=current_user.id if current_user else None,
            actor_name=current_user.full_name or current_user.email
            if current_user
            else "Carrier Representative",
        )
        db.commit()
        db.refresh(attachment)
        return attachment
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload attachment: {str(e)}",
        )
