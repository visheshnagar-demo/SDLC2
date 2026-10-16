import os
from typing import Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query,
    status,
)
from sqlalchemy.orm import Session
from server.config import settings
from server.database import get_db
from server.models.user import User
from server.models.submission import ReinsuranceSubmission
from server.routers.auth_router import get_current_user
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionUpdate,
    SubmissionResponse,
    SubmissionListResponse,
    AttachmentResponse,
)
from server.schemas.underwriting import UnderwritingSubmissionDetail
from server.services.submission_service import SubmissionService
from server.services.underwriting_service import UnderwritingService

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_submission(
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = SubmissionService.create_submission(db=db, carrier=current_user, data=data)
    return SubmissionResponse(
        id=sub.id,
        submission_reference=sub.submission_reference,
        carrier_id=sub.carrier_id,
        carrier_name=current_user.full_name,
        risk_type=sub.risk_type,
        insured_name=sub.insured_name,
        industry_segment=sub.industry_segment,
        annual_revenue=sub.annual_revenue,
        sum_insured=sub.sum_insured,
        attachment_point=sub.attachment_point,
        policy_start_date=sub.policy_start_date,
        policy_end_date=sub.policy_end_date,
        prior_claims_count=sub.prior_claims_count,
        prior_claims_total=sub.prior_claims_total,
        security_governance_score=sub.security_governance_score,
        status=sub.status,
        risk_score=sub.risk_score,
        risk_tier=sub.risk_tier,
        missing_flags_count=len(sub.missing_flags),
        active_lock_user_id=sub.active_lock_user_id,
        locked_at=sub.locked_at,
        created_at=sub.created_at,
        updated_at=sub.updated_at,
    )


@router.get("", response_model=SubmissionListResponse)
def list_carrier_submissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Underwriters can see all, carriers see their own
    if current_user.role in ["underwriter", "admin"]:
        query = db.query(ReinsuranceSubmission)
        if status:
            query = query.filter(ReinsuranceSubmission.status == status.upper())
        total = query.count()
        subs = (
            query.order_by(ReinsuranceSubmission.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    else:
        total, subs = SubmissionService.get_submissions_for_carrier(
            db=db,
            carrier_id=current_user.id,
            status=status,
            skip=skip,
            limit=limit,
        )

    items = [
        SubmissionResponse(
            id=s.id,
            submission_reference=s.submission_reference,
            carrier_id=s.carrier_id,
            carrier_name=s.carrier.full_name if s.carrier else "Unknown",
            risk_type=s.risk_type,
            insured_name=s.insured_name,
            industry_segment=s.industry_segment,
            annual_revenue=s.annual_revenue,
            sum_insured=s.sum_insured,
            attachment_point=s.attachment_point,
            policy_start_date=s.policy_start_date,
            policy_end_date=s.policy_end_date,
            prior_claims_count=s.prior_claims_count,
            prior_claims_total=s.prior_claims_total,
            security_governance_score=s.security_governance_score,
            status=s.status,
            risk_score=s.risk_score,
            risk_tier=s.risk_tier,
            missing_flags_count=len(s.missing_flags),
            active_lock_user_id=s.active_lock_user_id,
            locked_at=s.locked_at,
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
        for s in subs
    ]

    return SubmissionListResponse(total=total, skip=skip, limit=limit, items=items)


@router.get("/{submission_id}", response_model=UnderwritingSubmissionDetail)
def get_submission(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detail = UnderwritingService.get_submission_detail(
        db=db, submission_id=submission_id
    )
    if not detail:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Scoped access for carrier
    if (
        current_user.role not in ["underwriter", "admin"]
        and detail["carrier_id"] != current_user.id
    ):
        raise HTTPException(
            status_code=403, detail="Not authorized to access this submission"
        )

    return detail


@router.put("/{submission_id}", response_model=SubmissionResponse)
@router.patch("/{submission_id}", response_model=SubmissionResponse)
def update_submission(
    submission_id: str,
    data: SubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if (
        current_user.role not in ["underwriter", "admin"]
        and sub.carrier_id != current_user.id
    ):
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this submission"
        )

    updated = SubmissionService.update_submission(
        db=db, submission=sub, data=data, user=current_user
    )
    return SubmissionResponse(
        id=updated.id,
        submission_reference=updated.submission_reference,
        carrier_id=updated.carrier_id,
        carrier_name=updated.carrier.full_name if updated.carrier else "Unknown",
        risk_type=updated.risk_type,
        insured_name=updated.insured_name,
        industry_segment=updated.industry_segment,
        annual_revenue=updated.annual_revenue,
        sum_insured=updated.sum_insured,
        attachment_point=updated.attachment_point,
        policy_start_date=updated.policy_start_date,
        policy_end_date=updated.policy_end_date,
        prior_claims_count=updated.prior_claims_count,
        prior_claims_total=updated.prior_claims_total,
        security_governance_score=updated.security_governance_score,
        status=updated.status,
        risk_score=updated.risk_score,
        risk_tier=updated.risk_tier,
        missing_flags_count=len(updated.missing_flags),
        active_lock_user_id=updated.active_lock_user_id,
        locked_at=updated.locked_at,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.post(
    "/{submission_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_attachment(
    submission_id: str,
    file: UploadFile = File(...),
    document_category: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    if (
        current_user.role not in ["underwriter", "admin"]
        and sub.carrier_id != current_user.id
    ):
        raise HTTPException(
            status_code=403, detail="Not authorized to attach files to this submission"
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_bytes = await file.read()
    file_size = len(file_bytes)
    storage_path = os.path.join(settings.UPLOAD_DIR, f"{submission_id}_{file.filename}")

    with open(storage_path, "wb") as f:
        f.write(file_bytes)

    att = SubmissionService.add_attachment(
        db=db,
        submission=sub,
        user=current_user,
        document_category=document_category,
        file_name=file.filename or "uploaded_file",
        file_size_bytes=file_size,
        mime_type=file.content_type or "application/octet-stream",
        storage_path=storage_path,
    )

    return AttachmentResponse(
        id=att.id,
        attachment_id=att.id,
        submission_id=att.submission_id,
        document_category=att.document_category,
        file_name=att.file_name,
        file_size_bytes=att.file_size_bytes,
        mime_type=att.mime_type,
        uploaded_at=att.uploaded_at,
    )
