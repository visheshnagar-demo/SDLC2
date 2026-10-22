from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from server.models import Submission, UnderwritingAuthority, UnderwritingDecision
from server.schemas import (
    ReferralDecisionRequestSchema,
    SubmissionDecisionRequestSchema,
    SubmissionResponseSchema,
)
from server.services.audit_service import record_audit_log
from server.services.intake_service import map_submission_to_response

VALID_STATUSES = {
    "RECEIVED",
    "IN_REVIEW",
    "INFO_REQUESTED",
    "QUOTED",
    "BOUND",
    "DECLINED",
    "REFERRED_TO_MANAGER",
}


def get_submissions_queue(
    db: Session,
    status: str | None = None,
    line_of_business: str | None = None,
    risk_tier: str | None = None,
    ceding_company: str | None = None,
    current_user_email: str | None = None,
    current_user_role: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[SubmissionResponseSchema]:
    query = db.query(Submission)

    if current_user_role == "ROLE_CEDANT" and current_user_email:
        query = query.filter(Submission.created_by == current_user_email)

    if status and status.upper() != "ALL":
        query = query.filter(Submission.status == status.upper())

    if line_of_business and line_of_business.upper() != "ALL":
        query = query.filter(Submission.line_of_business == line_of_business)

    if risk_tier and risk_tier.upper() != "ALL":
        query = query.filter(Submission.risk_tier == risk_tier.upper())

    if ceding_company:
        query = query.filter(
            Submission.ceding_company_name.ilike(f"%{ceding_company}%")
        )

    submissions = (
        query.order_by(Submission.created_at.desc()).offset(skip).limit(limit).all()
    )
    return [map_submission_to_response(s) for s in submissions]


def get_submission_detail(
    db: Session,
    submission_id: str,
    current_user_email: str | None = None,
    current_user_role: str | None = None,
) -> SubmissionResponseSchema:
    submission = db.query(Submission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=404, detail=f"Submission {submission_id} not found"
        )

    if current_user_role == "ROLE_CEDANT" and current_user_email:
        if submission.created_by != current_user_email:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You can only view your own company's submissions",
            )

    return map_submission_to_response(submission)


def update_submission_status(
    db: Session,
    submission_id: str,
    request: SubmissionDecisionRequestSchema,
    user_email: str = "underwriter@example.com",
    user_role: str = "ROLE_UNDERWRITER",
) -> SubmissionResponseSchema:
    submission = db.query(Submission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=404, detail=f"Submission {submission_id} not found"
        )

    target_status = request.targetStatus.upper()
    if target_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status: {target_status}. Allowed: {VALID_STATUSES}",
        )

    if target_status == "DECLINED":
        if not request.declineReason or not request.declineReason.strip():
            raise HTTPException(
                status_code=400,
                detail="Mandatory decline reason is required when declining a submission",
            )

    prev_status = submission.status

    # Check authority limit for underwriter
    auth = db.query(UnderwritingAuthority).filter_by(role_name="UNDERWRITER").first()
    authority_limit = auth.max_policy_limit if auth else 5000000.00

    if target_status in ("QUOTED", "BOUND"):
        if user_role != "ROLE_MANAGER" and submission.policy_limit > authority_limit:
            target_status = "REFERRED_TO_MANAGER"
            submission.is_referred = True

    submission.status = target_status
    submission.updated_at = datetime.now(UTC)

    # Record decision
    import uuid

    dec = UnderwritingDecision(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        previous_status=prev_status,
        new_status=target_status,
        decline_reason=request.declineReason,
        underwriter_notes=request.underwriterNotes,
        decided_by=user_email,
        user_role=user_role,
        created_at=datetime.now(UTC),
    )
    db.add(dec)
    db.commit()
    db.refresh(submission)

    record_audit_log(
        db=db,
        submission_id=submission.id,
        action_type="STATUS_CHANGE",
        user_id=user_email,
        user_role=user_role,
        change_summary=f"Status changed from {prev_status} to {target_status}"
        + (f" (Reason: {request.declineReason})" if request.declineReason else ""),
        previous_state=prev_status,
        new_state=target_status,
    )

    return map_submission_to_response(submission)


def decide_referral(
    db: Session,
    submission_id: str,
    request: ReferralDecisionRequestSchema,
    user_email: str = "admin@example.com",
    user_role: str = "ROLE_MANAGER",
) -> SubmissionResponseSchema:
    if user_role != "ROLE_MANAGER":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Only Underwriting Managers can decide on referrals",
        )

    submission = db.query(Submission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=404, detail=f"Submission {submission_id} not found"
        )

    prev_status = submission.status
    decision_up = request.decision.upper()

    if decision_up == "APPROVE":
        target_status = "QUOTED"
        submission.is_referred = False
    else:
        target_status = "DECLINED"
        submission.is_referred = False

    submission.status = target_status
    submission.updated_at = datetime.now(UTC)

    import uuid

    dec = UnderwritingDecision(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        previous_status=prev_status,
        new_status=target_status,
        underwriter_notes=f"Manager Referral Decision: {decision_up}. Notes: {request.managerNotes}",
        decided_by=user_email,
        user_role="ROLE_MANAGER",
        created_at=datetime.now(UTC),
    )
    db.add(dec)
    db.commit()
    db.refresh(submission)

    record_audit_log(
        db=db,
        submission_id=submission.id,
        action_type="REFERRAL_DECIDED",
        user_id=user_email,
        user_role="ROLE_MANAGER",
        change_summary=f"Manager referral {decision_up}. Notes: {request.managerNotes}",
        previous_state=prev_status,
        new_state=target_status,
    )

    return map_submission_to_response(submission)
