from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server import models, schemas

router = APIRouter(prefix="/api/v1", tags=["Decisions & Audit"])


@router.post(
    "/submissions/{submission_id}/decisions",
    response_model=schemas.DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/submissions/{submission_id}/decision",
    response_model=schemas.DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_decision_alias(
    submission_id: str,
    payload: schemas.DecisionCreate,
    db: Session = Depends(get_db),
):
    sub = (
        db.query(models.ReinsuranceSubmission)
        .filter(
            (models.ReinsuranceSubmission.id == submission_id)
            | (models.ReinsuranceSubmission.tracking_number == submission_id)
        )
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission {submission_id} not found",
        )

    decision_type = payload.decision_type.upper().strip()
    if decision_type not in ["QUOTE", "DECLINE"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="decision_type must be either 'QUOTE' or 'DECLINE'",
        )

    previous_status = sub.status
    new_status = "QUOTED" if decision_type == "QUOTE" else "DECLINED"
    sub.status = new_status

    decision = models.UnderwritingDecision(
        submission_id=sub.id,
        decision_type=decision_type,
        quoted_capacity=payload.quoted_capacity,
        premium_rate_pct=payload.premium_rate_pct,
        quoted_premium=payload.quoted_premium,
        quote_validity_days=payload.quote_validity_days,
        decline_reason_code=payload.decline_reason_code,
        underwriter_notes=payload.underwriter_notes,
        decided_by=payload.decided_by or "underwriter@reinsurance.com",
    )
    db.add(decision)

    audit = models.AuditLog(
        submission_id=sub.id,
        actor_id=payload.decided_by or "underwriter@reinsurance.com",
        actor_role="Reinsurance_Underwriter",
        action=f"DECISION_{decision_type}",
        state_before=previous_status,
        state_after=new_status,
        details=f"Decision recorded: {decision_type}",
    )
    db.add(audit)

    db.commit()
    db.refresh(decision)
    return decision


@router.get(
    "/submissions/{submission_id}/audit",
    response_model=List[schemas.AuditLogResponse],
)
@router.get(
    "/submissions/{submission_id}/audit-trail",
    response_model=List[schemas.AuditLogResponse],
)
def get_submission_audit_alias(
    submission_id: str,
    db: Session = Depends(get_db),
):
    sub = (
        db.query(models.ReinsuranceSubmission)
        .filter(
            (models.ReinsuranceSubmission.id == submission_id)
            | (models.ReinsuranceSubmission.tracking_number == submission_id)
        )
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission {submission_id} not found",
        )

    logs = (
        db.query(models.AuditLog)
        .filter(models.AuditLog.submission_id == sub.id)
        .order_by(models.AuditLog.timestamp.asc())
        .all()
    )
    return logs
