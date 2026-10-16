import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from server.database import get_db
from server.models import (
    User,
    ReinsuranceSubmission,
    RiskScore,
    MissingInformationFlag,
    AuditLog,
)
from server.schemas import (
    UnderwritingQueueResponse,
    UnderwritingQueueItem,
    RiskScoreResponse,
    AuditLogResponse,
)
from server.routers.auth import get_current_underwriter, get_current_user
from server.services.flagging_engine import evaluate_missing_information
from server.services.scoring_engine import calculate_risk_score

router = APIRouter(prefix="/api/v1/underwriting", tags=["underwriting"])


@router.get("/queue", response_model=UnderwritingQueueResponse)
def get_underwriter_queue(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    risk_type: Optional[str] = None,
    risk_tier: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ReinsuranceSubmission).outerjoin(
        RiskScore, ReinsuranceSubmission.id == RiskScore.submission_id
    )

    if status:
        query = query.filter(ReinsuranceSubmission.status == status.upper())
    if risk_type:
        query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
    if risk_tier:
        query = query.filter(RiskScore.risk_tier == risk_tier.upper())
    if min_score is not None:
        query = query.filter(RiskScore.overall_score >= min_score)
    if max_score is not None:
        query = query.filter(RiskScore.overall_score <= max_score)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (ReinsuranceSubmission.insured_name.ilike(s))
            | (ReinsuranceSubmission.tracking_number.ilike(s))
            | (ReinsuranceSubmission.industry_sector.ilike(s))
        )

    # Sorting
    if sort_by == "score":
        order_col = RiskScore.overall_score
    else:
        order_col = ReinsuranceSubmission.created_at

    if sort_order.lower() == "asc":
        query = query.order_by(asc(order_col))
    else:
        query = query.order_by(desc(order_col))

    total = query.count()
    submissions = query.offset(skip).limit(limit).all()

    items: List[UnderwritingQueueItem] = []
    for sub in submissions:
        score_val = sub.risk_score.overall_score if sub.risk_score else None
        tier_val = sub.risk_score.risk_tier if sub.risk_score else None
        flags = [
            {
                "field_name": f.field_name,
                "severity": f.flag_severity,
                "description": f.description,
                "is_resolved": f.is_resolved,
            }
            for f in (sub.missing_flags or [])
            if not f.is_resolved
        ]

        items.append(
            UnderwritingQueueItem(
                id=sub.id,
                tracking_number=sub.tracking_number,
                insured_name=sub.insured_name,
                risk_type=sub.risk_type,
                industry_sector=sub.industry_sector,
                requested_limit=sub.requested_reinsurance_limit,
                attachment_point=sub.attachment_point,
                status=sub.status,
                overall_risk_score=score_val,
                risk_tier=tier_val,
                missing_flags_count=len(flags),
                missing_flags=flags,
                submitted_at=sub.created_at,
            )
        )

    return UnderwritingQueueResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/submissions/{id}/score", response_model=RiskScoreResponse)
def recompute_risk_score(
    id: str,
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

    # Re-evaluate missing info
    new_flags = evaluate_missing_information(
        submission, submission.risk_profile, submission.documents
    )

    # Update or replace flags
    db.query(MissingInformationFlag).filter(
        MissingInformationFlag.submission_id == submission.id
    ).delete()
    for f in new_flags:
        flag = MissingInformationFlag(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            field_name=f["field_name"],
            flag_severity=f["flag_severity"],
            description=f["description"],
            is_resolved=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(flag)

    # Recalculate score
    score_data = calculate_risk_score(
        submission, submission.risk_profile, submission.documents, new_flags
    )

    risk_score = submission.risk_score
    if not risk_score:
        risk_score = RiskScore(
            id=str(uuid.uuid4()),
            submission_id=submission.id,
            overall_score=score_data["overall_score"],
            completeness_score=score_data["completeness_score"],
            exposure_score=score_data["exposure_score"],
            loss_score=score_data["loss_score"],
            governance_score=score_data["governance_score"],
            risk_tier=score_data["risk_tier"],
            scoring_breakdown=score_data["scoring_breakdown"],
            scored_at=datetime.now(timezone.utc),
        )
        db.add(risk_score)
    else:
        risk_score.overall_score = score_data["overall_score"]
        risk_score.completeness_score = score_data["completeness_score"]
        risk_score.exposure_score = score_data["exposure_score"]
        risk_score.loss_score = score_data["loss_score"]
        risk_score.governance_score = score_data["governance_score"]
        risk_score.risk_tier = score_data["risk_tier"]
        risk_score.scoring_breakdown = score_data["scoring_breakdown"]
        risk_score.scored_at = datetime.now(timezone.utc)

    # Write audit log
    audit = AuditLog(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        actor_id=current_user.id if current_user else "SYSTEM",
        actor_role=current_user.role if current_user else "UNDERWRITER",
        action="RISK_SCORE_RECOMPUTED",
        state_before=None,
        state_after={
            "overall_score": score_data["overall_score"],
            "risk_tier": score_data["risk_tier"],
            "flags_count": len(new_flags),
        },
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)

    db.commit()
    db.refresh(risk_score)

    return risk_score


@router.get("/submissions/{id}/audit", response_model=List[AuditLogResponse])
def get_submission_audit_trail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    logs = (
        db.query(AuditLog)
        .filter(AuditLog.submission_id == submission.id)
        .order_by(asc(AuditLog.timestamp))
        .all()
    )
    return logs
