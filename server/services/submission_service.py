import uuid
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from server.models.submission import ReinsuranceSubmission
from server.models.attachment import SubmissionAttachment
from server.models.risk_score import RiskScoreBreakdown
from server.models.missing_flag import MissingInformationFlag
from server.schemas.submission import SubmissionCreate, AttachmentCreate
from server.services.scoring_engine import calculate_risk_score
from server.services.missing_detector import detect_missing_information
from server.services.audit_service import log_audit


def generate_submission_reference(risk_type: str) -> str:
    prefix = "CYBER" if "CYBER" in (risk_type or "").upper() else "DO"
    unique_suffix = str(uuid.uuid4())[:8].upper()
    return f"FAC-{prefix}-{unique_suffix}"


def create_submission(
    db: Session,
    payload: SubmissionCreate,
    carrier_id: Optional[str] = None,
    carrier_name: Optional[str] = None,
) -> ReinsuranceSubmission:
    submission_id = str(uuid.uuid4())
    reference = generate_submission_reference(payload.risk_type)

    # 1. Run Automated Risk Scoring Engine
    risk_score, risk_tier, score_rules = calculate_risk_score(
        risk_type=payload.risk_type,
        annual_revenue=payload.annual_revenue,
        sum_insured=payload.sum_insured,
        attachment_point=payload.attachment_point,
        prior_claims_count=payload.prior_claims_count,
        prior_claims_total=payload.prior_claims_total,
        security_governance_score=payload.security_governance_score,
        industry_segment=payload.industry_segment,
    )

    # 2. Run Missing Information Detector
    missing_flags_data = detect_missing_information(
        insured_name=payload.insured_name,
        industry_segment=payload.industry_segment,
        annual_revenue=payload.annual_revenue,
        sum_insured=payload.sum_insured,
        attachment_point=payload.attachment_point,
        policy_start_date=payload.policy_start_date or "",
        policy_end_date=payload.policy_end_date or "",
        prior_claims_count=payload.prior_claims_count,
        security_governance_score=payload.security_governance_score,
        attachments=[],
    )

    effective_carrier_name = (
        carrier_name or payload.carrier_name or "Apex Mutual Insurance"
    )

    submission = ReinsuranceSubmission(
        id=submission_id,
        submission_reference=reference,
        carrier_id=carrier_id,
        carrier_name=effective_carrier_name,
        insured_name=payload.insured_name,
        industry_segment=payload.industry_segment,
        risk_type=payload.risk_type.upper(),
        annual_revenue=payload.annual_revenue,
        sum_insured=payload.sum_insured,
        attachment_point=payload.attachment_point,
        policy_start_date=payload.policy_start_date,
        policy_end_date=payload.policy_end_date,
        prior_claims_count=payload.prior_claims_count,
        prior_claims_total=payload.prior_claims_total,
        security_governance_score=payload.security_governance_score,
        risk_score=risk_score,
        risk_tier=risk_tier,
        status=payload.status or "SUBMITTED",
    )
    db.add(submission)

    # Persist risk score breakdowns
    for rule in score_rules:
        breakdown = RiskScoreBreakdown(
            id=str(uuid.uuid4()),
            submission_id=submission_id,
            rule_key=rule["rule_key"],
            rule_name=rule["rule_name"],
            score_delta=rule["score_delta"],
            rationale=rule["rationale"],
        )
        db.add(breakdown)

    # Persist missing flags
    for flag in missing_flags_data:
        missing_flag = MissingInformationFlag(
            id=str(uuid.uuid4()),
            submission_id=submission_id,
            field_name=flag["field_name"],
            flag_type=flag["flag_type"],
            message=flag["message"],
            is_resolved=False,
        )
        db.add(missing_flag)

    log_audit(
        db,
        entity_type="reinsurance_submission",
        entity_id=submission_id,
        action="SUBMISSION_CREATED",
        actor_id=carrier_id,
        actor_name=effective_carrier_name,
        details=f"Created {payload.risk_type} submission {reference} with initial risk score {risk_score:.1f} ({risk_tier})",
    )

    return submission


def add_attachment_to_submission(
    db: Session,
    submission_id: str,
    payload: AttachmentCreate,
    actor_id: Optional[str] = None,
    actor_name: Optional[str] = None,
) -> Tuple[SubmissionAttachment, ReinsuranceSubmission]:
    submission = (
        db.query(ReinsuranceSubmission)
        .options(
            joinedload(ReinsuranceSubmission.attachments),
            joinedload(ReinsuranceSubmission.missing_flags),
        )
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise ValueError(f"Submission {submission_id} not found")

    attachment = SubmissionAttachment(
        id=str(uuid.uuid4()),
        submission_id=submission_id,
        file_name=payload.file_name,
        file_type=payload.file_type,
        file_size=payload.file_size or 1024,
        file_url=payload.file_url
        or f"/attachments/{submission_id}/{payload.file_name}",
        document_category=payload.document_category or "SUPPORTING_DOC",
    )
    db.add(attachment)

    # Re-evaluate missing flags with updated attachment list
    current_attachments = list(submission.attachments) + [attachment]
    new_flags = detect_missing_information(
        insured_name=submission.insured_name,
        industry_segment=submission.industry_segment,
        annual_revenue=float(submission.annual_revenue),
        sum_insured=float(submission.sum_insured),
        attachment_point=float(submission.attachment_point),
        policy_start_date=submission.policy_start_date or "",
        policy_end_date=submission.policy_end_date or "",
        prior_claims_count=submission.prior_claims_count,
        security_governance_score=float(submission.security_governance_score),
        attachments=current_attachments,
    )

    # Remove existing flags and replace with updated evaluation
    for flag in submission.missing_flags:
        db.delete(flag)

    for flag_data in new_flags:
        flag_obj = MissingInformationFlag(
            id=str(uuid.uuid4()),
            submission_id=submission_id,
            field_name=flag_data["field_name"],
            flag_type=flag_data["flag_type"],
            message=flag_data["message"],
            is_resolved=False,
        )
        db.add(flag_obj)

    log_audit(
        db,
        entity_type="submission_attachment",
        entity_id=attachment.id,
        action="ATTACHMENT_UPLOADED",
        actor_id=actor_id,
        actor_name=actor_name,
        details=f"Uploaded {payload.file_name} ({payload.document_category}) for submission {submission.submission_reference}",
    )

    return attachment, submission


def get_submission_by_id(
    db: Session, submission_id: str
) -> Optional[ReinsuranceSubmission]:
    return (
        db.query(ReinsuranceSubmission)
        .options(
            joinedload(ReinsuranceSubmission.attachments),
            joinedload(ReinsuranceSubmission.risk_score_breakdowns),
            joinedload(ReinsuranceSubmission.missing_flags),
            joinedload(ReinsuranceSubmission.decisions),
        )
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )


def list_carrier_submissions(
    db: Session,
    carrier_id: Optional[str] = None,
    risk_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[ReinsuranceSubmission]:
    query = db.query(ReinsuranceSubmission).options(
        joinedload(ReinsuranceSubmission.attachments),
        joinedload(ReinsuranceSubmission.risk_score_breakdowns),
        joinedload(ReinsuranceSubmission.missing_flags),
    )

    if carrier_id:
        query = query.filter(ReinsuranceSubmission.carrier_id == carrier_id)
    if risk_type:
        query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
    if status:
        query = query.filter(ReinsuranceSubmission.status == status.upper())

    return (
        query.order_by(ReinsuranceSubmission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
