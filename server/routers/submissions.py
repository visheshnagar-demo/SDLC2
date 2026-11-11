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
)
from server.schemas.decision import DecisionCreate, DecisionResponse, DeclineReason
from server.services.submission_service import (
    create_submission,
    list_submissions,
    get_submission_detail,
    get_submission_flags,
)
from server.services.decision_service import (
    record_underwriting_decision,
    get_decline_reasons,
)

router = APIRouter(prefix="/api/v1/submissions", tags=["Submissions"])


@router.post(
    "", response_model=SubmissionCreatedResponse, status_code=status.HTTP_201_CREATED
)
def submit_reinsurance_request(
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
):
    submission = create_submission(db, payload)
    latest_score_obj = (
        db.query(RiskScore)
        .filter(RiskScore.submission_id == submission.id)
        .order_by(desc(RiskScore.created_at))
        .first()
    )
    flag_count = (
        db.query(MissingInfoFlag)
        .filter(
            MissingInfoFlag.submission_id == submission.id,
            MissingInfoFlag.is_resolved.is_(False),
        )
        .count()
    )

    calculated_score = (
        float(latest_score_obj.calculated_score) if latest_score_obj else 50.0
    )

    return SubmissionCreatedResponse(
        id=submission.id,
        submission_number=submission.submission_number,
        risk_type=submission.risk_type,
        status=submission.status,
        risk_score=calculated_score,
        missing_flags_count=flag_count,
        created_at=submission.created_at,
    )


@router.get(
    "/decline-reasons", response_model=List[DeclineReason], tags=["Submissions"]
)
@router.get(
    "/decline_reasons", response_model=List[DeclineReason], tags=["Submissions"]
)
def get_submission_decline_reasons():
    return get_decline_reasons()


@router.get("", response_model=PaginatedSubmissionsResponse)
def get_submissions_queue(
    risk_type: Optional[str] = Query(None, description="Filter by CYBER or DO"),
    status: Optional[str] = Query(
        None,
        description="Filter by status (e.g. SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED)",
    ),
    min_score: Optional[float] = Query(
        None, description="Filter by minimum risk score"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = list_submissions(
        db,
        risk_type=risk_type,
        status=status,
        min_score=min_score,
        skip=skip,
        limit=limit,
    )
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
        "flags": [MissingInfoFlagResponse.model_validate(f) for f in flags],
    }


@router.post("/{id}/decisions", response_model=DecisionResponse)
def submit_underwriting_decision(
    id: str,
    payload: DecisionCreate,
    db: Session = Depends(get_db),
):
    return record_underwriting_decision(db, id, payload)
