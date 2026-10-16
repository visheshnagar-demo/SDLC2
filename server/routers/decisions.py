import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import (
    User,
    ReinsuranceSubmission,
    UnderwritingDecision,
    AuditLog,
)
from server.schemas import DecisionCreate, DecisionResponse
from server.routers.auth import get_current_underwriter

router = APIRouter(prefix="/api/v1/underwriting", tags=["decisions"])


@router.post(
    "/submissions/{id}/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_decision(
    id: str,
    payload: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_underwriter),
):
    submission = (
        db.query(ReinsuranceSubmission).filter(ReinsuranceSubmission.id == id).first()
    )
    if not submission:
        submission = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.tracking_number == id)
            .first()
        )

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reinsurance submission with ID '{id}' not found.",
        )

    # Validate decision payloads
    if payload.decision_type == "QUOTE":
        if payload.quoted_capacity is not None and payload.quoted_capacity <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Quoted capacity must be greater than zero.",
            )
        # Auto-compute premium if capacity & rate provided and premium is omitted
        quoted_premium = payload.quoted_premium
        if (
            quoted_premium is None
            and payload.quoted_capacity
            and payload.premium_rate_pct
        ):
            quoted_premium = round(
                payload.quoted_capacity * payload.premium_rate_pct, 2
            )

        new_status = "QUOTED"
    else:  # DECLINE
        if not payload.decline_reason_code:
            payload.decline_reason_code = "RISK_APPETITE_MISMATCH"
        quoted_premium = None
        new_status = "DECLINED"

    old_status = submission.status
    submission.status = new_status
    submission.updated_at = datetime.now(timezone.utc)

    # Check if decision already exists
    existing_decision = (
        db.query(UnderwritingDecision)
        .filter(UnderwritingDecision.submission_id == submission.id)
        .first()
    )
    if existing_decision:
        existing_decision.underwriter_id = current_user.id if current_user else None
        existing_decision.decision_type = payload.decision_type
        existing_decision.quoted_capacity = payload.quoted_capacity
        existing_decision.premium_rate_pct = payload.premium_rate_pct
        existing_decision.quoted_premium = quoted_premium
        existing_decision.quote_validity_days = payload.quote_validity_days
        existing_decision.decline_reason_code = payload.decline_reason_code
        existing_decision.underwriter_notes = payload.underwriter_notes
        existing_decision.decided_at = datetime.now(timezone.utc)
        decision_record = existing_decision
    else:
        decision_record = UnderwritingDecision(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            underwriter_id=current_user.id if current_user else None,
            decision_type=payload.decision_type,
            quoted_capacity=payload.quoted_capacity,
            premium_rate_pct=payload.premium_rate_pct,
            quoted_premium=quoted_premium,
            quote_validity_days=payload.quote_validity_days,
            decline_reason_code=payload.decline_reason_code,
            underwriter_notes=payload.underwriter_notes,
            decided_at=datetime.now(timezone.utc),
        )
        db.add(decision_record)

    # Write audit log entry
    audit = AuditLog(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        actor_id=current_user.id if current_user else "SYSTEM",
        actor_role=current_user.role if current_user else "UNDERWRITER",
        action=f"DECISION_{payload.decision_type}",
        state_before={"status": old_status},
        state_after={
            "status": new_status,
            "decision_type": payload.decision_type,
            "quoted_capacity": payload.quoted_capacity,
            "decline_reason_code": payload.decline_reason_code,
        },
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)

    db.commit()
    db.refresh(decision_record)

    return decision_record
