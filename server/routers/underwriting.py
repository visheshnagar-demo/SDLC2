from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from server.database import get_db
from server.models import ReinsuranceSubmission, CarrierProfile
from server.schemas import (
    QueueItemResponse,
    ScoreBreakdownResponse,
    ChecklistStatusResponse,
    MissingInfoFlagResponse,
)
from server.services.scoring_engine import (
    calculate_risk_score,
    get_detailed_scoring_breakdown,
)
from server.services.checklist_service import evaluate_checklist, resolve_single_flag

router = APIRouter(
    prefix="/api/v1/underwriting", tags=["Underwriting Review Queue & Scoring"]
)


@router.get("/queue", response_model=List[QueueItemResponse])
def get_underwriting_queue(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    risk_type: Optional[str] = Query(None, description="Filter by CYBER or D_AND_O"),
    risk_tier: Optional[str] = Query(
        None, description="Filter by LOW, MEDIUM, HIGH, CRITICAL"
    ),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status (e.g. SUBMITTED, UNDER_REVIEW)",
    ),
    sort_by: Optional[str] = Query(
        "score_desc",
        description="Sort by score_desc, score_asc, date_desc, date_asc, limit_desc",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(ReinsuranceSubmission).join(
        CarrierProfile, ReinsuranceSubmission.carrier_id == CarrierProfile.id
    )

    if risk_type:
        query = query.filter(ReinsuranceSubmission.risk_type == risk_type.upper())
    if risk_tier:
        query = query.filter(ReinsuranceSubmission.risk_tier == risk_tier.upper())
    if status_filter:
        query = query.filter(ReinsuranceSubmission.status == status_filter.upper())

    # Sorting
    if sort_by == "score_asc":
        query = query.order_by(asc(ReinsuranceSubmission.risk_score))
    elif sort_by == "date_asc":
        query = query.order_by(asc(ReinsuranceSubmission.created_at))
    elif sort_by == "date_desc":
        query = query.order_by(desc(ReinsuranceSubmission.created_at))
    elif sort_by == "limit_desc":
        query = query.order_by(desc(ReinsuranceSubmission.limit_requested))
    else:  # score_desc (default priority triage)
        query = query.order_by(
            desc(ReinsuranceSubmission.risk_score),
            desc(ReinsuranceSubmission.created_at),
        )

    submissions = query.offset(skip).limit(limit).all()

    results: List[QueueItemResponse] = []
    for sub in submissions:
        carrier_name = sub.carrier.carrier_name if sub.carrier else "Unknown Carrier"
        unresolved_flags_count = sum(1 for f in sub.missing_flags if not f.is_resolved)
        results.append(
            QueueItemResponse(
                id=sub.id,
                carrier_id=sub.carrier_id,
                carrier_name=carrier_name,
                risk_type=sub.risk_type,
                insured_name=sub.insured_name,
                industry_sector=sub.industry_sector,
                limit_requested=sub.limit_requested,
                attachment_point=sub.attachment_point,
                retention=sub.retention,
                risk_score=sub.risk_score,
                risk_tier=sub.risk_tier,
                status=sub.status,
                missing_flags_count=unresolved_flags_count,
                created_at=sub.created_at,
            )
        )

    return results


@router.get("/{submission_id}/score-breakdown", response_model=ScoreBreakdownResponse)
def get_score_breakdown(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )

    breakdown = get_detailed_scoring_breakdown(submission)
    return breakdown


@router.get("/{submission_id}/checklist", response_model=ChecklistStatusResponse)
def get_submission_checklist(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )

    flags = evaluate_checklist(db, submission_id)
    unresolved_flags = [f for f in flags if not f.is_resolved]
    total_checks = 6  # standard comprehensive check rule set
    passed_checks = max(0, total_checks - len(unresolved_flags))

    return ChecklistStatusResponse(
        submission_id=submission_id,
        total_checks=total_checks,
        passed_checks=passed_checks,
        missing_flags=[MissingInfoFlagResponse.model_validate(f) for f in flags],
        is_complete=(len(unresolved_flags) == 0),
    )


@router.post("/{submission_id}/request-info", status_code=status.HTTP_200_OK)
def request_missing_information(
    submission_id: str,
    notes: Optional[str] = Query(
        None, description="Notes detailing what info is needed"
    ),
    db: Session = Depends(get_db),
):
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )

    submission.status = "INFORMATION_REQUESTED"
    if notes:
        existing_notes = submission.notes or ""
        submission.notes = f"{existing_notes}\n[Information Requested]: {notes}".strip()

    db.commit()
    return {
        "message": "Submission status updated to INFORMATION_REQUESTED.",
        "submission_id": submission_id,
    }


@router.post("/{submission_id}/resolve-flag/{flag_id}", status_code=status.HTTP_200_OK)
def resolve_flag(submission_id: str, flag_id: str, db: Session = Depends(get_db)):
    success = resolve_single_flag(db, flag_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Missing info flag not found."
        )
    return {"message": "Flag resolved successfully.", "flag_id": flag_id}


@router.post(
    "/{submission_id}/recalculate-score", response_model=ScoreBreakdownResponse
)
def recalculate_score(submission_id: str, db: Session = Depends(get_db)):
    submission = db.query(ReinsuranceSubmission).filter_by(id=submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found."
        )

    score, tier = calculate_risk_score(submission)
    submission.risk_score = score
    submission.risk_tier = tier
    db.commit()
    db.refresh(submission)

    return get_detailed_scoring_breakdown(submission)
