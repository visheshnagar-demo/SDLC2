from typing import Any

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Submission
from server.schemas import (
    AuditLogResponseSchema,
    CreateSubmissionRequestSchema,
    DocumentUploadResponseSchema,
    ReferralDecisionRequestSchema,
    RiskScoreResponseSchema,
    SubmissionDecisionRequestSchema,
    SubmissionResponseSchema,
)
from server.services.audit_service import get_audit_trail_for_submission
from server.services.intake_service import create_submission, upload_document
from server.services.scoring_engine import score_and_save_submission
from server.services.workflow_service import (
    decide_referral,
    get_submission_detail,
    get_submissions_queue,
    update_submission_status,
)

router = APIRouter(prefix="/api/v1/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionResponseSchema, status_code=201)
def handle_create_submission(
    payload: CreateSubmissionRequestSchema,
    x_user_email: str | None = Header("cedant@example.com", alias="X-User-Email"),
    x_user_role: str | None = Header("ROLE_CEDANT", alias="X-User-Role"),
    db: Session = Depends(get_db),
):
    return create_submission(
        db=db,
        request=payload,
        user_email=x_user_email or "cedant@example.com",
        user_role=x_user_role or "ROLE_CEDANT",
    )


@router.post(
    "/{submission_id}/documents",
    response_model=DocumentUploadResponseSchema,
    status_code=201,
)
def handle_upload_document(
    submission_id: str,
    file: UploadFile = File(...),
    documentType: str = Form("APPLICATION"),
    x_user_email: str | None = Header("cedant@example.com", alias="X-User-Email"),
    x_user_role: str | None = Header("ROLE_CEDANT", alias="X-User-Role"),
    db: Session = Depends(get_db),
):
    return upload_document(
        db=db,
        submission_id=submission_id,
        file=file,
        document_type=documentType,
        user_email=x_user_email or "cedant@example.com",
        user_role=x_user_role or "ROLE_CEDANT",
    )


@router.get("", response_model=list[SubmissionResponseSchema])
def handle_get_submissions(
    status: str | None = None,
    lineOfBusiness: str | None = None,
    riskTier: str | None = None,
    cedingCompany: str | None = None,
    skip: int = 0,
    limit: int = 50,
    x_user_email: str | None = Header(None, alias="X-User-Email"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    db: Session = Depends(get_db),
):
    return get_submissions_queue(
        db=db,
        status=status,
        line_of_business=lineOfBusiness,
        risk_tier=riskTier,
        ceding_company=cedingCompany,
        current_user_email=x_user_email,
        current_user_role=x_user_role,
        skip=skip,
        limit=limit,
    )


@router.get("/{submission_id}", response_model=SubmissionResponseSchema)
def handle_get_submission(
    submission_id: str,
    x_user_email: str | None = Header(None, alias="X-User-Email"),
    x_user_role: str | None = Header(None, alias="X-User-Role"),
    db: Session = Depends(get_db),
):
    return get_submission_detail(
        db=db,
        submission_id=submission_id,
        current_user_email=x_user_email,
        current_user_role=x_user_role,
    )


@router.post("/{submission_id}/score", response_model=RiskScoreResponseSchema)
def handle_score_submission(
    submission_id: str,
    attributes: dict[str, Any] | None = None,
    db: Session = Depends(get_db),
):
    submission = db.query(Submission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=404, detail=f"Submission {submission_id} not found"
        )

    return score_and_save_submission(db, submission, attributes or {})


@router.patch("/{submission_id}/status", response_model=SubmissionResponseSchema)
def handle_update_status(
    submission_id: str,
    payload: SubmissionDecisionRequestSchema,
    x_user_email: str | None = Header("underwriter@example.com", alias="X-User-Email"),
    x_user_role: str | None = Header("ROLE_UNDERWRITER", alias="X-User-Role"),
    db: Session = Depends(get_db),
):
    return update_submission_status(
        db=db,
        submission_id=submission_id,
        request=payload,
        user_email=x_user_email or "underwriter@example.com",
        user_role=x_user_role or "ROLE_UNDERWRITER",
    )


@router.post(
    "/{submission_id}/referral/decision", response_model=SubmissionResponseSchema
)
def handle_referral_decision(
    submission_id: str,
    payload: ReferralDecisionRequestSchema,
    x_user_email: str | None = Header("admin@example.com", alias="X-User-Email"),
    x_user_role: str | None = Header("ROLE_MANAGER", alias="X-User-Role"),
    db: Session = Depends(get_db),
):
    return decide_referral(
        db=db,
        submission_id=submission_id,
        request=payload,
        user_email=x_user_email or "admin@example.com",
        user_role=x_user_role or "ROLE_MANAGER",
    )


@router.get("/{submission_id}/audit-trail", response_model=list[AuditLogResponseSchema])
def handle_get_audit_trail(submission_id: str, db: Session = Depends(get_db)):
    return get_audit_trail_for_submission(db, submission_id)
