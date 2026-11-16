import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from server.models.submission import ReinsuranceSubmission
from server.models.attachment import SubmissionAttachment
from server.models.risk_score import RiskScoreBreakdown
from server.models.missing_flag import MissingInformationFlag
from server.models.user import User
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionUpdate,
    AttachmentCreate,
)
from server.services.scoring_engine import evaluate_risk
from server.services.missing_detector import detect_missing_information
from server.services.audit_service import log_action


def generate_submission_reference(risk_type: str) -> str:
    prefix = "CYBER" if "CYBER" in risk_type.upper() else "DNO"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"FAC-{prefix}-{timestamp}-{short_uuid}"


def create_submission(
    db: Session,
    carrier: User,
    data: SubmissionCreate,
    status: str = "SUBMITTED",
) -> ReinsuranceSubmission:
    submission_id = str(uuid.uuid4())
    ref = generate_submission_reference(data.risk_type)

    submission_dict = data.model_dump()
    final_score, risk_tier, breakdowns = evaluate_risk(submission_dict)
    missing_flags = detect_missing_information(submission_dict, [])

    submission = ReinsuranceSubmission(
        id=submission_id,
        submission_reference=ref,
        carrier_id=carrier.id,
        risk_type=data.risk_type.upper(),
        insured_name=data.insured_name,
        industry_segment=data.industry_segment,
        annual_revenue=data.annual_revenue,
        sum_insured=data.sum_insured,
        attachment_point=data.attachment_point,
        policy_start_date=data.policy_start_date,
        policy_end_date=data.policy_end_date,
        prior_claims_count=data.prior_claims_count,
        prior_claims_total=data.prior_claims_total,
        security_governance_score=data.security_governance_score,
        status=status,
        risk_score=final_score,
        risk_tier=risk_tier,
        notes=data.notes,
    )
    db.add(submission)

    for b in breakdowns:
        score_row = RiskScoreBreakdown(
            id=str(uuid.uuid4()),
            submission_id=submission_id,
            rule_key=b["rule_key"],
            rule_name=b["rule_name"],
            score_delta=b["score_delta"],
            rationale=b["rationale"],
        )
        db.add(score_row)

    for m in missing_flags:
        flag_row = MissingInformationFlag(
            id=str(uuid.uuid4()),
            submission_id=submission_id,
            field_name=m["field_name"],
            flag_type=m["flag_type"],
            message=m["message"],
            is_resolved=False,
        )
        db.add(flag_row)

    db.commit()
    db.refresh(submission)

    log_action(
        db,
        entity_type="reinsurance_submission",
        entity_id=submission.id,
        action="SUBMISSION_CREATED",
        actor_id=carrier.id,
        details={"reference": ref, "risk_tier": risk_tier, "risk_score": final_score},
    )

    return submission


def list_submissions(
    db: Session,
    user: User,
    status: Optional[str] = None,
    risk_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[ReinsuranceSubmission]:
    query = db.query(ReinsuranceSubmission)
    if user.role == "carrier":
        query = query.filter(ReinsuranceSubmission.carrier_id == user.id)
    if status:
        query = query.filter(ReinsuranceSubmission.status == status.upper())
    if risk_type:
        query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
    return (
        query.order_by(ReinsuranceSubmission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_submission_by_id(
    db: Session,
    submission_id: str,
    user: Optional[User] = None,
) -> ReinsuranceSubmission:
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        # Check by reference as well
        submission = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.submission_reference == submission_id)
            .first()
        )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if user and user.role == "carrier" and submission.carrier_id != user.id:
        raise HTTPException(
            status_code=403, detail="Access forbidden: you do not own this submission"
        )
    return submission


def update_submission(
    db: Session,
    submission_id: str,
    user: User,
    data: SubmissionUpdate,
) -> ReinsuranceSubmission:
    submission = get_submission_by_id(db, submission_id, user)
    if submission.status in ["QUOTED", "DECLINED"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot edit submission that has already been decided",
        )

    update_dict = data.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        if val is not None:
            setattr(submission, key, val)

    # Re-evaluate risk and missing flags
    merged_data = {
        "risk_type": submission.risk_type,
        "annual_revenue": submission.annual_revenue,
        "sum_insured": submission.sum_insured,
        "attachment_point": submission.attachment_point,
        "policy_start_date": submission.policy_start_date,
        "policy_end_date": submission.policy_end_date,
        "prior_claims_count": submission.prior_claims_count,
        "prior_claims_total": submission.prior_claims_total,
        "security_governance_score": submission.security_governance_score,
        "industry_segment": submission.industry_segment,
    }
    final_score, risk_tier, breakdowns = evaluate_risk(merged_data)
    submission.risk_score = final_score
    submission.risk_tier = risk_tier
    submission.updated_at = datetime.now(timezone.utc)

    # Refresh score breakdowns
    db.query(RiskScoreBreakdown).filter(
        RiskScoreBreakdown.submission_id == submission.id
    ).delete()
    for b in breakdowns:
        score_row = RiskScoreBreakdown(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            rule_key=b["rule_key"],
            rule_name=b["rule_name"],
            score_delta=b["score_delta"],
            rationale=b["rationale"],
        )
        db.add(score_row)

    # Refresh missing flags considering existing attachments
    existing_categories = [a.document_category for a in submission.attachments]
    new_flags = detect_missing_information(merged_data, existing_categories)
    db.query(MissingInformationFlag).filter(
        MissingInformationFlag.submission_id == submission.id
    ).delete()
    for m in new_flags:
        flag_row = MissingInformationFlag(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            field_name=m["field_name"],
            flag_type=m["flag_type"],
            message=m["message"],
            is_resolved=False,
        )
        db.add(flag_row)

    db.commit()
    db.refresh(submission)

    log_action(
        db,
        entity_type="reinsurance_submission",
        entity_id=submission.id,
        action="SUBMISSION_UPDATED",
        actor_id=user.id,
        details={"updated_fields": list(update_dict.keys())},
    )

    return submission


def add_submission_attachment(
    db: Session,
    submission_id: str,
    user: User,
    attachment_in: AttachmentCreate,
) -> SubmissionAttachment:
    submission = get_submission_by_id(db, submission_id, user)
    att_id = str(uuid.uuid4())
    attachment = SubmissionAttachment(
        id=att_id,
        submission_id=submission.id,
        file_name=attachment_in.file_name,
        file_type=attachment_in.file_type,
        file_size=attachment_in.file_size,
        file_path=attachment_in.file_path,
        document_category=attachment_in.document_category.upper(),
        uploaded_by=user.id,
    )
    db.add(attachment)
    db.commit()
    db.refresh(submission)

    # Re-evaluate missing flags with new attachment categories
    categories = [a.document_category for a in submission.attachments]
    merged_data = {
        "risk_type": submission.risk_type,
        "annual_revenue": submission.annual_revenue,
        "sum_insured": submission.sum_insured,
        "attachment_point": submission.attachment_point,
        "policy_start_date": submission.policy_start_date,
        "policy_end_date": submission.policy_end_date,
        "prior_claims_count": submission.prior_claims_count,
        "prior_claims_total": submission.prior_claims_total,
        "security_governance_score": submission.security_governance_score,
        "industry_segment": submission.industry_segment,
    }
    flags = detect_missing_information(merged_data, categories)
    db.query(MissingInformationFlag).filter(
        MissingInformationFlag.submission_id == submission.id
    ).delete()
    for m in flags:
        flag_row = MissingInformationFlag(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            field_name=m["field_name"],
            flag_type=m["flag_type"],
            message=m["message"],
            is_resolved=False,
        )
        db.add(flag_row)

    db.commit()
    db.refresh(attachment)

    log_action(
        db,
        entity_type="submission_attachment",
        entity_id=attachment.id,
        action="ATTACHMENT_UPLOADED",
        actor_id=user.id,
        details={
            "file_name": attachment.file_name,
            "category": attachment.document_category,
        },
    )

    return attachment
