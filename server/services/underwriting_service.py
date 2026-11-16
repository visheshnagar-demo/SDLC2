import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException

from server.models.submission import ReinsuranceSubmission
from server.models.decision import UnderwritingDecision
from server.models.user import User
from server.schemas.decision import DecisionCreate
from server.schemas.underwriting import UnderwritingQueueItem
from server.services.audit_service import log_action


def get_underwriting_queue(
    db: Session,
    risk_type: Optional[str] = None,
    risk_tier: Optional[str] = None,
    status: Optional[str] = None,
    carrier_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "risk_score",
    sort_order: str = "desc",
    skip: int = 0,
    limit: int = 50,
) -> Tuple[int, List[UnderwritingQueueItem]]:
    query = db.query(ReinsuranceSubmission)

    if risk_type:
        query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
    if risk_tier:
        query = query.filter(ReinsuranceSubmission.risk_tier == risk_tier.upper())
    if status:
        query = query.filter(ReinsuranceSubmission.status == status.upper())
    if carrier_id:
        query = query.filter(ReinsuranceSubmission.carrier_id == carrier_id)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                ReinsuranceSubmission.insured_name.ilike(term),
                ReinsuranceSubmission.submission_reference.ilike(term),
                ReinsuranceSubmission.industry_segment.ilike(term),
            )
        )

    total = query.count()

    # Sorting
    order_func = desc if sort_order.lower() == "desc" else asc
    if sort_by == "risk_score":
        query = query.order_by(order_func(ReinsuranceSubmission.risk_score))
    elif sort_by == "created_at":
        query = query.order_by(order_func(ReinsuranceSubmission.created_at))
    elif sort_by == "sum_insured":
        query = query.order_by(order_func(ReinsuranceSubmission.sum_insured))
    elif sort_by == "attachment_point":
        query = query.order_by(order_func(ReinsuranceSubmission.attachment_point))
    elif sort_by == "insured_name":
        query = query.order_by(order_func(ReinsuranceSubmission.insured_name))
    else:
        query = query.order_by(desc(ReinsuranceSubmission.created_at))

    submissions = query.offset(skip).limit(limit).all()

    items: List[UnderwritingQueueItem] = []
    for sub in submissions:
        carrier_name = (
            sub.carrier.company_name
            if sub.carrier and sub.carrier.company_name
            else (sub.carrier.full_name if sub.carrier else "Unknown Carrier")
        )
        missing_count = len(sub.missing_flags)
        blocking_count = len(
            [
                f
                for f in sub.missing_flags
                if f.flag_type == "BLOCKING" and not f.is_resolved
            ]
        )

        items.append(
            UnderwritingQueueItem(
                id=sub.id,
                submission_reference=sub.submission_reference,
                carrier_id=sub.carrier_id,
                carrier_name=carrier_name,
                insured_name=sub.insured_name,
                risk_type=sub.risk_type,
                sum_insured=sub.sum_insured,
                attachment_point=sub.attachment_point,
                risk_score=sub.risk_score,
                risk_tier=sub.risk_tier,
                status=sub.status,
                missing_flags_count=missing_count,
                blocking_flags_count=blocking_count,
                active_lock_user_id=sub.active_lock_user_id,
                created_at=sub.created_at,
            )
        )

    return total, items


def handle_submission_lock(
    db: Session,
    submission_id: str,
    underwriter: User,
    action: str = "acquire",
) -> Dict[str, Any]:
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    now = datetime.now(timezone.utc)
    # Ensure compare is timezone safe
    lock_expires = submission.lock_expires_at
    if lock_expires and lock_expires.tzinfo is None:
        lock_expires = lock_expires.replace(tzinfo=timezone.utc)

    if action == "acquire":
        if (
            submission.active_lock_user_id
            and submission.active_lock_user_id != underwriter.id
            and lock_expires
            and lock_expires > now
        ):
            return {
                "submission_id": submission.id,
                "locked": True,
                "active_lock_user_id": submission.active_lock_user_id,
                "lock_expires_at": submission.lock_expires_at,
                "message": "Submission is currently locked by another underwriter",
            }

        submission.active_lock_user_id = underwriter.id
        submission.lock_expires_at = now + timedelta(minutes=15)
        if submission.status == "SUBMITTED":
            submission.status = "UNDER_REVIEW"

        db.commit()
        db.refresh(submission)

        log_action(
            db,
            entity_type="reinsurance_submission",
            entity_id=submission.id,
            action="LOCK_ACQUIRED",
            actor_id=underwriter.id,
        )

        return {
            "submission_id": submission.id,
            "locked": True,
            "active_lock_user_id": underwriter.id,
            "lock_expires_at": submission.lock_expires_at,
            "message": "Review lock acquired successfully (15-minute lease)",
        }
    else:  # release
        submission.active_lock_user_id = None
        submission.lock_expires_at = None
        db.commit()
        db.refresh(submission)

        log_action(
            db,
            entity_type="reinsurance_submission",
            entity_id=submission.id,
            action="LOCK_RELEASED",
            actor_id=underwriter.id,
        )

        return {
            "submission_id": submission.id,
            "locked": False,
            "active_lock_user_id": None,
            "lock_expires_at": None,
            "message": "Review lock released",
        }


def record_underwriting_decision(
    db: Session,
    submission_id: str,
    underwriter: User,
    data: DecisionCreate,
) -> UnderwritingDecision:
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    dec_upper = data.decision.upper()
    if dec_upper not in ["QUOTE", "DECLINE"]:
        raise HTTPException(
            status_code=422, detail="Decision must be either QUOTE or DECLINE"
        )

    if dec_upper == "DECLINE" and not data.decline_reason_code:
        raise HTTPException(
            status_code=422,
            detail="Mandatory decline_reason_code is required when declining a submission",
        )

    decision_id = str(uuid.uuid4())
    decision = UnderwritingDecision(
        id=decision_id,
        submission_id=submission.id,
        underwriter_id=underwriter.id,
        decision=dec_upper,
        capacity_offered=data.capacity_offered,
        rate_on_line_pct=data.rate_on_line_pct,
        premium_amount=data.premium_amount,
        binding_deadline=data.binding_deadline,
        subjectivities=data.subjectivities,
        decline_reason_code=data.decline_reason_code,
        decline_notes=data.decline_notes,
    )
    db.add(decision)

    submission.status = "QUOTED" if dec_upper == "QUOTE" else "DECLINED"
    submission.active_lock_user_id = None
    submission.lock_expires_at = None
    submission.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(decision)
    db.refresh(submission)

    log_action(
        db,
        entity_type="underwriting_decision",
        entity_id=decision.id,
        action=f"DECISION_{dec_upper}",
        actor_id=underwriter.id,
        details={
            "submission_id": submission.id,
            "decision": dec_upper,
            "reason_code": data.decline_reason_code,
            "premium_amount": data.premium_amount,
        },
    )

    return decision


def get_underwriting_kpis(db: Session) -> Dict[str, int]:
    total = db.query(ReinsuranceSubmission).count()
    pending = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.status.in_(["SUBMITTED", "UNDER_REVIEW"]))
        .count()
    )
    low_risk = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.risk_tier == "LOW")
        .count()
    )
    med_risk = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.risk_tier == "MEDIUM")
        .count()
    )
    high_risk = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.risk_tier == "HIGH")
        .count()
    )
    quoted = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.status == "QUOTED")
        .count()
    )
    declined = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.status == "DECLINED")
        .count()
    )

    return {
        "total_submissions": total,
        "pending_review": pending,
        "low_risk_count": low_risk,
        "medium_risk_count": med_risk,
        "high_risk_count": high_risk,
        "quoted_count": quoted,
        "declined_count": declined,
    }
