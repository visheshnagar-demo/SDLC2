import json
import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from server.models import Submission, SubmissionDocument
from server.schemas import (
    CreateSubmissionRequestSchema,
    DocumentUploadResponseSchema,
    FactorScoreItemSchema,
    SubmissionResponseSchema,
)
from server.services.audit_service import record_audit_log
from server.services.scoring_engine import score_and_save_submission
from server.services.validation_service import validate_submission_payload


def map_submission_to_response(submission: Submission) -> SubmissionResponseSchema:
    docs = [
        DocumentUploadResponseSchema(
            id=d.id,
            submissionId=d.submission_id,
            documentType=d.document_type,
            fileName=d.file_name,
            storageUrl=d.storage_url,
            mimeType=d.mime_type,
            fileSizeBytes=d.file_size_bytes,
            createdAt=d.created_at,
        )
        for d in submission.documents
    ]

    factors = [
        FactorScoreItemSchema(
            factorCategory=f.factor_category,
            factorName=f.factor_name,
            pointsEarned=f.score_awarded,
            maxPoints=f.max_score,
            evaluationNotes=f.evaluation_notes,
        )
        for f in submission.factor_breakdowns
    ]

    now = datetime.now(UTC)
    created_at_utc = (
        submission.created_at
        if submission.created_at.tzinfo
        else submission.created_at.replace(tzinfo=UTC)
    )
    age_hours = int((now - created_at_utc).total_seconds() // 3600)
    sla = "GREEN" if age_hours <= 24 else ("YELLOW" if age_hours <= 48 else "RED")

    risk_attrs = None
    if submission.risk_attributes_json:
        try:
            risk_attrs = json.loads(submission.risk_attributes_json)
        except Exception:
            risk_attrs = {}

    return SubmissionResponseSchema(
        id=submission.id,
        cedingCompanyName=submission.ceding_company_name,
        insuredName=submission.insured_name,
        lineOfBusiness=submission.line_of_business,
        policyLimit=submission.policy_limit,
        attachmentPoint=submission.attachment_point,
        retention=submission.retention,
        grossPremium=submission.gross_premium,
        effectiveDate=submission.effective_date,
        expiryDate=submission.expiry_date,
        industry=submission.industry,
        revenueBand=submission.revenue_band,
        jurisdiction=submission.jurisdiction,
        status=submission.status,
        riskScore=submission.risk_score,
        riskTier=submission.risk_tier,
        isReferred=submission.is_referred or False,
        assignedUnderwriterId=submission.assigned_underwriter_id,
        createdBy=submission.created_by,
        createdAt=submission.created_at,
        updatedAt=submission.updated_at,
        riskAttributes=risk_attrs,
        factorBreakdown=factors,
        documents=docs,
        slaIndicator=sla,
        ageHours=age_hours,
    )


def create_submission(
    db: Session,
    request: CreateSubmissionRequestSchema,
    user_email: str = "cedant@example.com",
    user_role: str = "ROLE_CEDANT",
) -> SubmissionResponseSchema:
    errors = validate_submission_payload(request)
    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    submission = Submission(
        id=str(uuid.uuid4()),
        ceding_company_name=request.cedingCompanyName,
        insured_name=request.insuredName,
        line_of_business=request.lineOfBusiness,
        policy_limit=request.policyLimit,
        attachment_point=request.attachmentPoint,
        retention=request.retention,
        gross_premium=request.grossPremium,
        effective_date=request.effectiveDate,
        expiry_date=request.expiryDate,
        industry=request.industry,
        revenue_band=request.revenueBand,
        jurisdiction=request.jurisdiction,
        status="RECEIVED",
        created_by=user_email,
        risk_attributes_json=json.dumps(request.riskAttributes or {}),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Score submission
    score_and_save_submission(db, submission, request.riskAttributes or {})

    # Audit log
    record_audit_log(
        db=db,
        submission_id=submission.id,
        action_type="SUBMISSION_CREATED",
        user_id=user_email,
        user_role=user_role,
        change_summary=f"Created submission for {submission.insured_name} ({submission.line_of_business})",
        previous_state=None,
        new_state="RECEIVED",
    )

    db.refresh(submission)
    return map_submission_to_response(submission)


def upload_document(
    db: Session,
    submission_id: str,
    file: UploadFile,
    document_type: str = "APPLICATION",
    user_email: str = "cedant@example.com",
    user_role: str = "ROLE_CEDANT",
) -> DocumentUploadResponseSchema:
    submission = db.query(Submission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=404, detail=f"Submission {submission_id} not found"
        )

    content = file.file.read()
    file_size = len(content)

    doc = SubmissionDocument(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        document_type=document_type,
        file_name=file.filename or "upload.bin",
        storage_url=f"/storage/documents/{submission.id}/{file.filename}",
        mime_type=file.content_type,
        file_size_bytes=file_size,
        created_at=datetime.now(UTC),
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    record_audit_log(
        db=db,
        submission_id=submission.id,
        action_type="DOCUMENT_UPLOADED",
        user_id=user_email,
        user_role=user_role,
        change_summary=f"Uploaded document {file.filename} ({document_type})",
        previous_state=None,
        new_state=None,
    )

    return DocumentUploadResponseSchema(
        id=doc.id,
        submissionId=doc.submission_id,
        documentType=doc.document_type,
        fileName=doc.file_name,
        storageUrl=doc.storage_url,
        mimeType=doc.mime_type,
        fileSizeBytes=doc.file_size_bytes,
        createdAt=doc.created_at,
    )
