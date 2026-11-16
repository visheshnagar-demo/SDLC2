from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server import models, schemas
from server.services.scoring_engine import RiskScoringEngine
from server.routers.submissions import DECLINE_REASONS_CATALOGUE

router = APIRouter(
    prefix="/api/v1/underwriting", tags=["Underwriting Queue & Decisions"]
)


@router.get("/decline-reasons", response_model=List[schemas.DeclineReason])
@router.get("/reasons", response_model=List[schemas.DeclineReason])
def get_underwriting_decline_reasons():
    return DECLINE_REASONS_CATALOGUE


@router.get("/queue", response_model=List[schemas.QueueItemResponse])
def get_underwriting_queue(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    risk_type: Optional[str] = None,
    risk_tier: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.ReinsuranceSubmission)
    if status:
        query = query.filter(models.ReinsuranceSubmission.status == status.upper())
    if risk_type:
        rt = risk_type.upper().replace("&", "_AND_")
        query = query.filter(models.ReinsuranceSubmission.risk_type.like(f"%{rt}%"))
    if risk_tier:
        query = query.filter(
            models.ReinsuranceSubmission.risk_tier == risk_tier.upper()
        )
    if search:
        query = query.filter(
            models.ReinsuranceSubmission.insured_name.ilike(f"%{search}%")
            | models.ReinsuranceSubmission.tracking_number.ilike(f"%{search}%")
        )

    submissions = (
        query.order_by(models.ReinsuranceSubmission.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = []
    for s in submissions:
        items.append(
            schemas.QueueItemResponse(
                id=s.id,
                tracking_number=s.tracking_number,
                insured_name=s.insured_name,
                risk_type=s.risk_type,
                requested_limit=s.requested_reinsurance_limit,
                attachment_point=s.attachment_point,
                status=s.status,
                overall_risk_score=s.overall_risk_score or 0.0,
                risk_tier=s.risk_tier or "MEDIUM",
                missing_flags_count=s.missing_flags_count or 0,
                created_at=s.created_at,
            )
        )
    return items


@router.get(
    "/submissions/{submission_id}",
    response_model=schemas.ReinsuranceSubmissionResponse,
)
def get_underwriting_submission(
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
    return sub


@router.post(
    "/submissions/{submission_id}/score",
    response_model=schemas.RiskScoreResponse,
)
def recompute_risk_score(
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

    profile = (
        db.query(models.RiskProfile)
        .filter(models.RiskProfile.submission_id == sub.id)
        .first()
    )
    docs = (
        db.query(models.SubmissionDocument)
        .filter(models.SubmissionDocument.submission_id == sub.id)
        .all()
    )

    score_data = RiskScoringEngine.calculate_score(sub, profile, docs)
    sub.overall_risk_score = score_data["composite_score"]
    sub.risk_tier = score_data["risk_tier"]

    risk_score_obj = models.RiskScore(
        submission_id=sub.id,
        composite_score=score_data["composite_score"],
        completeness_score=score_data["completeness_score"],
        exposure_score=score_data["exposure_score"],
        loss_history_score=score_data["loss_history_score"],
        governance_score=score_data["governance_score"],
        risk_tier=score_data["risk_tier"],
        benchmark_delta=score_data["benchmark_delta"],
        notes=score_data["notes"],
    )
    db.add(risk_score_obj)

    audit = models.AuditLog(
        submission_id=sub.id,
        actor_id="underwriter_agent",
        actor_role="Reinsurance_Underwriter",
        action="RISK_SCORE_RECOMPUTED",
        state_before=str(sub.overall_risk_score),
        state_after=str(score_data["composite_score"]),
        details=f"Recomputed composite risk score: {score_data['composite_score']} ({score_data['risk_tier']})",
    )
    db.add(audit)

    db.commit()
    db.refresh(risk_score_obj)
    return risk_score_obj


@router.post(
    "/submissions/{submission_id}/decisions",
    response_model=schemas.DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_underwriting_decision(
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
    if decision_type == "QUOTE":
        new_status = "QUOTED"
    else:
        new_status = "DECLINED"

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
        details=f"Underwriter recorded {decision_type} decision. Notes: {payload.underwriter_notes or 'None'}",
    )
    db.add(audit)

    db.commit()
    db.refresh(decision)
    return decision


@router.get(
    "/submissions/{submission_id}/audit",
    response_model=List[schemas.AuditLogResponse],
)
def get_submission_audit_trail(
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


@router.post(
    "/submissions/{submission_id}/flags/{flag_id}/resolve",
    response_model=schemas.MissingInformationFlagResponse,
)
def resolve_missing_flag(
    submission_id: str,
    flag_id: str,
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

    flag = (
        db.query(models.MissingInformationFlag)
        .filter(
            models.MissingInformationFlag.id == flag_id,
            models.MissingInformationFlag.submission_id == sub.id,
        )
        .first()
    )
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flag {flag_id} not found",
        )

    flag.is_resolved = True
    flag.resolved_at = datetime.now(timezone.utc)

    # Recalculate unresolved flags count
    unresolved_count = (
        db.query(models.MissingInformationFlag)
        .filter(
            models.MissingInformationFlag.submission_id == sub.id,
            models.MissingInformationFlag.is_resolved == False,  # noqa: E712
        )
        .count()
    )
    sub.missing_flags_count = unresolved_count
    if unresolved_count == 0 and sub.status == "FLAGGED":
        sub.status = "UNDER_REVIEW"

    audit = models.AuditLog(
        submission_id=sub.id,
        actor_id="underwriter@reinsurance.com",
        actor_role="Reinsurance_Underwriter",
        action="FLAG_RESOLVED",
        state_before="UNRESOLVED",
        state_after="RESOLVED",
        details=f"Missing info flag '{flag.field_or_document_name}' resolved",
    )
    db.add(audit)

    db.commit()
    db.refresh(flag)
    return flag
