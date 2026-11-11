from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from server.models.submission import Submission
from server.models.evaluation import UnderwritingDecision
from server.schemas.decision import DecisionCreate
from server.services.audit_service import log_event

DECLINE_REASONS_CATALOGUE = [
    {"code": "RISK_APPETITE_EXCEEDED", "label": "Exceeds Maximum Risk Appetite / Exposure Limits"},
    {"code": "INADEQUATE_SECURITY_CONTROLS", "label": "Inadequate Security / Internal Controls"},
    {"code": "HIGH_HISTORICAL_LOSS_RATIO", "label": "Adverse Prior Loss Frequency or Severity"},
    {"code": "PRICING_TERMS_MISMATCH", "label": "Inadequate Primary Rate / Premium Inconsistency"},
    {"code": "CAPACITY_UNAVAILABLE", "label": "Reinsurance Capacity Fully Subscribed"},
    {"code": "UNRESOLVED_MISSING_INFO", "label": "Unresolved Mandatory Risk Information / Disclosures"},
]

VALID_DECLINE_CODES = {r["code"] for r in DECLINE_REASONS_CATALOGUE}


def get_decline_reasons() -> List[Dict[str, str]]:
    return DECLINE_REASONS_CATALOGUE


def record_underwriting_decision(
    db: Session,
    submission_id: str,
    payload: DecisionCreate,
    underwriter_id: str = "underwriter_system",
) -> Dict[str, Any]:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission {submission_id} not found")

    if payload.decision_type == "DECLINE":
        if not payload.decline_reason_code or payload.decline_reason_code not in VALID_DECLINE_CODES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid decline_reason_code. Must be one of: {list(VALID_DECLINE_CODES)}"
            )
        submission.status = "DECLINED"
    elif payload.decision_type == "QUOTE":
        submission.status = "QUOTED"

    decision = UnderwritingDecision(
        submission_id=submission.id,
        underwriter_id=underwriter_id,
        decision_type=payload.decision_type,
        offered_capacity=payload.offered_capacity,
        quoted_rate=payload.quoted_rate,
        quoted_premium=payload.quoted_premium,
        terms_conditions=payload.terms_conditions,
        exclusions=payload.exclusions or [],
        decline_reason_code=payload.decline_reason_code,
        decline_notes=payload.decline_notes,
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)
    db.refresh(submission)

    log_event(
        db,
        entity_type="DECISION",
        entity_id=submission.id,
        action=payload.decision_type,
        actor_id=underwriter_id,
        changes={
            "decision_type": payload.decision_type,
            "status": submission.status,
            "decline_reason_code": payload.decline_reason_code,
            "offered_capacity": payload.offered_capacity,
        },
    )

    return {
        "id": decision.id,
        "submission_id": submission.id,
        "decision_type": decision.decision_type,
        "status": submission.status,
        "offered_capacity": decision.offered_capacity,
        "quoted_rate": decision.quoted_rate,
        "quoted_premium": decision.quoted_premium,
        "terms_conditions": decision.terms_conditions,
        "exclusions": decision.exclusions or [],
        "decline_reason_code": decision.decline_reason_code,
        "decline_notes": decision.decline_notes,
        "recorded_at": decision.created_at,
    }
