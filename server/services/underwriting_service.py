import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from server.models.submission import ReinsuranceSubmission
from server.models.decision import UnderwritingDecision
from server.models.audit_log import AuditLog
from server.schemas.decision import DecisionCreate
from server.services.audit_service import log_audit


DECLINE_REASONS_CATALOGUE: List[Dict[str, str]] = [
    {
        "code": "HIGH_EXPOSURE_AGGREGATION",
        "category": "Portfolio Capacity & Accumulation",
        "description": "Aggregate geographical or cross-line catastrophic exposure exceeds treaty limits and risk tolerance.",
    },
    {
        "code": "POOR_CYBER_CONTROLS",
        "category": "Risk Quality Deficit",
        "description": "Critical gaps in multi-factor authentication, endpoint detection response, or offline backup isolation.",
    },
    {
        "code": "PRIOR_CLAIMS_SEVERITY",
        "category": "Loss History",
        "description": "Frequency or severity of historical claims indicates unacceptable loss probability.",
    },
    {
        "code": "INADEQUATE_ATTACHMENT_POINT",
        "category": "Pricing & Structure",
        "description": "Primary attachment point is insufficient relative to total exposed sum insured limit.",
    },
    {
        "code": "OUT_OF_APPETITE_INDUSTRY",
        "category": "Underwriting Guidelines",
        "description": "Target insured operations fall outside the published facultative reinsurance underwriting appetite.",
    },
    {
        "code": "CAPACITY_CONSTRAINT",
        "category": "Portfolio Capacity & Accumulation",
        "description": "Line capacity fully deployed for target class of business or current underwriting quarter.",
    },
    {
        "code": "SANCTIONS_OR_REGULATORY",
        "category": "Compliance & Sanctions",
        "description": "Insured entity or ultimate beneficial ownership conflicts with international regulatory sanctions.",
    },
]


def get_decline_reasons() -> List[Dict[str, str]]:
    return DECLINE_REASONS_CATALOGUE


def get_underwriting_queue(
    db: Session,
    risk_type: Optional[str] = None,
    risk_tier: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "risk_score_desc",
    skip: int = 0,
    limit: int = 100,
) -> List[ReinsuranceSubmission]:
    query = db.query(ReinsuranceSubmission).options(
        joinedload(ReinsuranceSubmission.missing_flags)
    )

    if risk_type:
        query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
    if risk_tier:
        query = query.filter(ReinsuranceSubmission.risk_tier == risk_tier.upper())
    if status:
        query = query.filter(ReinsuranceSubmission.status == status.upper())

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ReinsuranceSubmission.insured_name.ilike(search_pattern),
                ReinsuranceSubmission.submission_reference.ilike(search_pattern),
                ReinsuranceSubmission.carrier_name.ilike(search_pattern),
                ReinsuranceSubmission.industry_segment.ilike(search_pattern),
            )
        )

    # Sorting
    if sort_by == "risk_score_asc":
        query = query.order_by(
            asc(ReinsuranceSubmission.risk_score),
            desc(ReinsuranceSubmission.created_at),
        )
    elif sort_by == "created_at_desc":
        query = query.order_by(desc(ReinsuranceSubmission.created_at))
    elif sort_by == "created_at_asc":
        query = query.order_by(asc(ReinsuranceSubmission.created_at))
    elif sort_by == "sum_insured_desc":
        query = query.order_by(desc(ReinsuranceSubmission.sum_insured))
    else:  # default risk_score_desc
        query = query.order_by(
            desc(ReinsuranceSubmission.risk_score),
            desc(ReinsuranceSubmission.created_at),
        )

    return query.offset(skip).limit(limit).all()


def set_review_lock(
    db: Session,
    submission_id: str,
    action: str,
    user_id: str,
    user_name: str,
) -> Tuple[bool, Optional[str], Optional[str], Optional[datetime], str]:
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise ValueError(f"Submission {submission_id} not found")

    if action.lower() == "lock":
        if submission.active_lock_user_id and submission.active_lock_user_id != user_id:
            # Check lock timeout (e.g., 30 minutes)
            return (
                True,
                submission.active_lock_user_id,
                submission.active_lock_user_name,
                submission.active_lock_at,
                f"Submission is currently being reviewed by {submission.active_lock_user_name or 'another underwriter'}.",
            )

        submission.active_lock_user_id = user_id
        submission.active_lock_user_name = user_name
        submission.active_lock_at = datetime.now(timezone.utc)
        if submission.status == "SUBMITTED":
            submission.status = "UNDER_REVIEW"

        log_audit(
            db,
            entity_type="reinsurance_submission",
            entity_id=submission_id,
            action="REVIEW_LOCKED",
            actor_id=user_id,
            actor_name=user_name,
            details=f"Underwriter {user_name} acquired review lock",
        )
        return (
            True,
            submission.active_lock_user_id,
            submission.active_lock_user_name,
            submission.active_lock_at,
            "Review lock acquired successfully.",
        )

    elif action.lower() == "unlock":
        submission.active_lock_user_id = None
        submission.active_lock_user_name = None
        submission.active_lock_at = None

        log_audit(
            db,
            entity_type="reinsurance_submission",
            entity_id=submission_id,
            action="REVIEW_UNLOCKED",
            actor_id=user_id,
            actor_name=user_name,
            details=f"Underwriter {user_name} released review lock",
        )
        return (False, None, None, None, "Review lock released.")

    raise ValueError(f"Invalid lock action: {action}")


def record_underwriting_decision(
    db: Session,
    submission_id: str,
    payload: DecisionCreate,
    underwriter_id: Optional[str] = None,
    underwriter_name: Optional[str] = None,
) -> Tuple[UnderwritingDecision, ReinsuranceSubmission]:
    submission = (
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
    if not submission:
        raise ValueError(f"Submission {submission_id} not found")

    decision_norm = payload.decision.upper()
    if decision_norm not in ["QUOTE", "DECLINE"]:
        raise ValueError("Decision must be either 'QUOTE' or 'DECLINE'")

    if decision_norm == "DECLINE":
        if not payload.decline_reason_code or not payload.decline_reason_code.strip():
            raise ValueError(
                "Standardized decline reason code is mandatory when recording a decline decision."
            )
        submission.status = "DECLINED"
    else:  # QUOTE
        if payload.capacity_offered is None or payload.capacity_offered <= 0:
            raise ValueError(
                "Capacity offered must be specified and greater than zero for quotes."
            )
        if payload.premium_amount is None or payload.premium_amount <= 0:
            raise ValueError("Binding premium amount must be specified for quotes.")
        submission.status = "QUOTED"

    # Unlock the submission once decision is recorded
    submission.active_lock_user_id = None
    submission.active_lock_user_name = None
    submission.active_lock_at = None

    decision_obj = UnderwritingDecision(
        id=str(uuid.uuid4()),
        submission_id=submission_id,
        underwriter_id=underwriter_id,
        underwriter_name=underwriter_name or "Senior Underwriter",
        decision=decision_norm,
        capacity_offered=payload.capacity_offered,
        rate_on_line_pct=payload.rate_on_line_pct,
        premium_amount=payload.premium_amount,
        binding_deadline=payload.binding_deadline,
        subjectivities=payload.subjectivities,
        decline_reason_code=payload.decline_reason_code,
        decline_notes=payload.decline_notes,
    )
    db.add(decision_obj)

    log_audit(
        db,
        entity_type="underwriting_decision",
        entity_id=decision_obj.id,
        action=f"DECISION_{decision_norm}",
        actor_id=underwriter_id,
        actor_name=underwriter_name,
        details=(
            f"Underwriter recorded {decision_norm} decision for {submission.submission_reference}. "
            f"{'Reason: ' + str(payload.decline_reason_code) if decision_norm == 'DECLINE' else 'Capacity: $' + str(payload.capacity_offered)}"
        ),
    )

    return decision_obj, submission


def get_submission_audit_logs(db: Session, submission_id: str) -> List[AuditLog]:
    return (
        db.query(AuditLog)
        .filter(
            or_(
                AuditLog.entity_id == submission_id,
                AuditLog.details.contains(submission_id),
            )
        )
        .order_by(desc(AuditLog.created_at))
        .all()
    )
