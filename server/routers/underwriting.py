from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from server.database import get_db
from server.models.submission import Submission
from server.models.risk_score import RiskScore
from server.schemas.submission import QueueResponse, SubmissionRead
from server.services.submission_service import (
    get_underwriter_queue,
    recalculate_submission,
)

router = APIRouter(prefix="/underwriting", tags=["Underwriting Queue"])


@router.get("/queue", response_model=QueueResponse)
def get_workbench_queue(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    risk_type: Optional[str] = Query(None, description="CYBER or D_AND_O"),
    risk_tier: Optional[str] = Query(None, description="LOW, MEDIUM, HIGH, CRITICAL"),
    status: Optional[str] = Query(None, description="SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED"),
    carrier_id: Optional[str] = Query(None, description="Filter by Carrier ID"),
    sort_by: str = Query("composite_score", description="composite_score, requested_limit, created_at"),
    order: str = Query("desc", description="asc or desc"),
    db: Session = Depends(get_db),
):
    """
    Retrieve prioritized underwriter review queue with multi-field filtering and sorting.
    """
    total, items = get_underwriter_queue(
        db=db,
        skip=skip,
        limit=limit,
        risk_type=risk_type,
        risk_tier=risk_tier,
        status=status,
        carrier_id=carrier_id,
        sort_by=sort_by,
        order=order,
    )
    return QueueResponse(total=total, skip=skip, limit=limit, items=items)


@router.post("/score/{submission_id}", response_model=SubmissionRead)
def recalculate_risk_and_flags(
    submission_id: str,
    db: Session = Depends(get_db),
):
    """
    Trigger on-demand recalculation of risk score and missing information scan for a submission.
    """
    return recalculate_submission(db=db, submission_id=submission_id)


@router.get("/metrics")
def get_queue_metrics(
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get summary statistics for the underwriter review queue.
    """
    total_submissions = db.query(Submission).count()
    submitted_count = db.query(Submission).filter(Submission.status == "SUBMITTED").count()
    in_review_count = db.query(Submission).filter(Submission.status == "UNDER_REVIEW").count()
    quoted_count = db.query(Submission).filter(Submission.status == "QUOTED").count()
    declined_count = db.query(Submission).filter(Submission.status == "DECLINED").count()

    cyber_count = db.query(Submission).filter(Submission.risk_type == "CYBER").count()
    dno_count = db.query(Submission).filter(Submission.risk_type == "D_AND_O").count()

    high_or_critical_count = (
        db.query(RiskScore)
        .filter(RiskScore.risk_tier.in_(["HIGH", "CRITICAL"]))
        .count()
    )

    return {
        "total_submissions": total_submissions,
        "status_breakdown": {
            "SUBMITTED": submitted_count,
            "UNDER_REVIEW": in_review_count,
            "QUOTED": quoted_count,
            "DECLINED": declined_count,
        },
        "risk_type_breakdown": {
            "CYBER": cyber_count,
            "D_AND_O": dno_count,
        },
        "high_or_critical_risks": high_or_critical_count,
    }
