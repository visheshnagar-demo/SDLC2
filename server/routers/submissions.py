from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from server.database import get_db
from server.models.evaluation import RiskScore, MissingInfoFlag
from server.schemas.submission import (
    SubmissionCreate,
    SubmissionCreatedResponse,
    SubmissionDetailResponse,
    PaginatedSubmissionsResponse,
    MissingInfoFlagResponse,
    RiskScoreResponse,
)
from server.schemas.decision import DecisionCreate, DecisionResponse
from server.services.submission_service import (
    create_submission,
    list_submissions,
    get_submission_detail,
    get_submission_flags,
)
from server.services.decision_service import record_underwriting_decision

router = APIRouter(prefix="/api/v1/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionCreatedResponse, status_code=status.HTTP_201_CREATED)
def submit_reinsurance_request(
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
):
    submission = create_submission(db, payload)
    latest_score_obj = db.query(RiskScore).filter(RiskScore.submission_id == submission.id).order_by(desc(RiskScore.created_at)).first()
    flag_count = db.query(MissingInfoFlag).filter(MissingInfoFlag.submission_id == submission.id, MissingInfoFlag.is_resolved.is_(False)).count()

    score_resp = RiskScoreResponse(
        id=latest_score_obj.id if latest_score_obj else None,
        calculated_score=latest_score_obj.calculated_score if latest_score_obj else 50.0,
        risk_tier=latest_score_obj.risk_tier if latest_score_obj else "MEDIUM",
        scoring_breakdown=latest_score_obj.scoring_breakdown if latest_score_obj else {},
        is_calibrated=latest_score_obj.is_calibrated if latest_score_obj else True,
        created_at=latest_score_obj.created_at if latest_score_obj else submission.created_at,
    )

    return SubmissionCreatedResponse(
        id=submission.id,
        submission_number=submission.submission_number,
        status=submission.status,
        risk_score=score_resp,
        missing_flags_count=flag_count,
        created_at=submission.created_at,
    )


@router.get("", response_model=PaginatedSubmissionsResponse)
def get_submissions_queue(
    risk_type: Optional[str] = Query(None, description="Filter by CYBER or DO"),
    status: Optional[str] = Query(None, description="Filter by status (e.g. SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED)"),
    min_score: Optional[float] = Query(None, description="Filter by minimum risk score"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = list_submissions(db, risk_type=risk_type, status=status, min_score=min_score, skip=skip, limit=limit)
    return PaginatedSubmissionsResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=items,
    )


@router.get("/{id}", response_model=SubmissionDetailResponse)
def get_submission_by_id(
    id: str,
    db: Session = Depends(get_db),
):
    detail = get_submission_detail(db, id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Submission {id} not found")
    return detail


@router.get("/{id}/flags", response_model=Dict[str, Any])
def get_flags_for_submission(
    id: str,
    db: Session = Depends(get_db),
):
    flags = get_submission_flags(db, id)
    if flags is None:
        raise HTTPException(status_code=404, detail=f"Submission {id} not found")
    return {
        "submission_id": id,
        "flags": [
            MissingInfoFlagResponse.model_validate(f) for f in flags
        ],
    }


@router.post("/{id}/decisions", response_model=DecisionResponse)
def submit_underwriting_decision(
    id: str,
    payload: DecisionCreate,
    db: Session = Depends(get_db),
):
    return record_underwriting_decision(db, id, payload)
