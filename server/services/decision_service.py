from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from server.models import ReinsuranceSubmission, UnderwritingDecision
from server.schemas import QuoteDecisionRequest, DeclineDecisionRequest


def record_quote_decision(
    db: Session, req: QuoteDecisionRequest
) -> UnderwritingDecision:
    """Record a binding facultative quote decision on a submission."""
    submission = db.query(ReinsuranceSubmission).filter_by(id=req.submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission {req.submission_id} not found.",
        )

    if req.premium_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Premium amount must be greater than zero.",
        )

    if req.capacity_offered <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Capacity offered must be greater than zero.",
        )

    # Transition submission status
    submission.status = "QUOTED"
    submission.updated_at = datetime.utcnow()

    # Create or update decision
    decision = (
        db.query(UnderwritingDecision)
        .filter_by(submission_id=req.submission_id)
        .first()
    )
    if not decision:
        decision = UnderwritingDecision(
            submission_id=req.submission_id,
            decision_type="QUOTE",
            premium_amount=req.premium_amount,
            capacity_offered=req.capacity_offered,
            deductible_retention=req.deductible_retention,
            subjectivities=req.subjectivities,
            validity_period_days=req.validity_period_days or 30,
            underwriter_id=req.underwriter_id or "UW-AGENT-01",
            notes=req.notes,
            decision_timestamp=datetime.utcnow(),
        )
        db.add(decision)
    else:
        decision.decision_type = "QUOTE"
        decision.premium_amount = req.premium_amount
        decision.capacity_offered = req.capacity_offered
        decision.deductible_retention = req.deductible_retention
        decision.subjectivities = req.subjectivities
        decision.validity_period_days = req.validity_period_days or 30
        decision.decline_reason_code = None
        decision.underwriter_id = req.underwriter_id or "UW-AGENT-01"
        decision.notes = req.notes
        decision.decision_timestamp = datetime.utcnow()

    db.commit()
    db.refresh(decision)
    return decision


def record_decline_decision(
    db: Session, req: DeclineDecisionRequest
) -> UnderwritingDecision:
    """Record a formal decline decision on a submission."""
    submission = db.query(ReinsuranceSubmission).filter_by(id=req.submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission {req.submission_id} not found.",
        )

    if not req.decline_reason_code or not req.decline_reason_code.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Decline reason code is mandatory.",
        )

    # Transition submission status
    submission.status = "DECLINED"
    submission.updated_at = datetime.utcnow()

    # Create or update decision
    decision = (
        db.query(UnderwritingDecision)
        .filter_by(submission_id=req.submission_id)
        .first()
    )
    if not decision:
        decision = UnderwritingDecision(
            submission_id=req.submission_id,
            decision_type="DECLINE",
            premium_amount=None,
            capacity_offered=None,
            deductible_retention=None,
            subjectivities=None,
            decline_reason_code=req.decline_reason_code.strip().upper(),
            underwriter_id=req.underwriter_id or "UW-AGENT-01",
            notes=req.notes,
            decision_timestamp=datetime.utcnow(),
        )
        db.add(decision)
    else:
        decision.decision_type = "DECLINE"
        decision.premium_amount = None
        decision.capacity_offered = None
        decision.deductible_retention = None
        decision.subjectivities = None
        decision.decline_reason_code = req.decline_reason_code.strip().upper()
        decision.underwriter_id = req.underwriter_id or "UW-AGENT-01"
        decision.notes = req.notes
        decision.decision_timestamp = datetime.utcnow()

    db.commit()
    db.refresh(decision)
    return decision


def get_decision_by_submission(
    db: Session, submission_id: str
) -> Optional[UnderwritingDecision]:
    """Retrieve decision record for a submission."""
    return db.query(UnderwritingDecision).filter_by(submission_id=submission_id).first()
