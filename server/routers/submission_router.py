from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.user import User
from server.models.attachment import SubmissionAttachment
from server.routers.auth_router import get_current_user
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionUpdate,
    SubmissionResponse,
    AttachmentCreate,
    AttachmentResponse,
)
from server.schemas.decision import DeclineReason, STANDARD_DECLINE_REASONS
from server.services.submission_service import (
    create_submission,
    list_submissions,
    get_submission_by_id,
    update_submission,
    add_submission_attachment,
)

router = APIRouter(prefix="/api/v1", tags=["Carrier Submissions"])


@router.get("/submissions/decline-reasons", response_model=List[DeclineReason])
@router.get("/decline-reasons", response_model=List[DeclineReason])
def get_submission_decline_reasons():
    """Return the standardized catalogue of underwriting decline reasons."""
    return STANDARD_DECLINE_REASONS


@router.post(
    "/submissions",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_reinsurance_request(
    data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create and immediately evaluate a facultative reinsurance submission."""
    return create_submission(db, current_user, data)


@router.get("/submissions", response_model=List[SubmissionResponse])
def get_submissions(
    status_filter: Optional[str] = None,
    risk_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List submissions created by authenticated carrier or all for underwriters."""
    return list_submissions(
        db,
        current_user,
        status=status_filter,
        risk_type=risk_type,
        skip=skip,
        limit=limit,
    )


@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
def get_submission_detail(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get complete details, risk breakdown, and missing flags for a submission."""
    return get_submission_by_id(db, submission_id, current_user)


@router.put("/submissions/{submission_id}", response_model=SubmissionResponse)
@router.patch("/submissions/{submission_id}", response_model=SubmissionResponse)
def update_submission_detail(
    submission_id: str,
    data: SubmissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update risk parameters and re-calculate scores and missing tags."""
    return update_submission(db, submission_id, current_user, data)


@router.post(
    "/submissions/{submission_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_attachment(
    submission_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload supporting document metadata or file for a submission."""
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("file")
        doc_cat = form.get("document_category", "OTHER")
        file_name = form.get("file_name")
        if (
            uploaded_file
            and hasattr(uploaded_file, "filename")
            and uploaded_file.filename
        ):
            file_bytes = await uploaded_file.read()
            att_create = AttachmentCreate(
                file_name=uploaded_file.filename,
                file_type=uploaded_file.content_type or "application/octet-stream",
                file_size=len(file_bytes),
                file_path=f"/uploads/{submission_id}/{uploaded_file.filename}",
                document_category=str(doc_cat).upper(),
            )
        else:
            att_create = AttachmentCreate(
                file_name=str(file_name or "document.pdf"),
                file_type=str(form.get("file_type", "application/pdf")),
                file_size=int(form.get("file_size", 0)),
                file_path=str(form.get("file_path", "")),
                document_category=str(doc_cat).upper(),
            )
    else:
        try:
            body = await request.json()
            att_create = AttachmentCreate(**body)
        except Exception:
            raise HTTPException(
                status_code=400, detail="Invalid attachment payload or format"
            )

    return add_submission_attachment(db, submission_id, current_user, att_create)


@router.get(
    "/submissions/{submission_id}/attachments", response_model=List[AttachmentResponse]
)
def get_submission_attachments(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all attachments associated with a submission."""
    submission = get_submission_by_id(db, submission_id, current_user)
    return (
        db.query(SubmissionAttachment)
        .filter(SubmissionAttachment.submission_id == submission.id)
        .all()
    )
