from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.user import User
from server.models.submission import ReinsuranceSubmission
from server.models.decision import UnderwritingDecision
from server.routers.auth_router import get_current_user
from server.schemas.decision import (
    DecisionCreate,
    DecisionResponse,
    DeclineReason,
    STANDARD_DECLINE_REASONS,
)
from server.schemas.underwriting import (
    LockRequest,
    LockResponse,
    UnderwritingQueueResponse,
    UnderwritingDetailResponse,
    UnderwritingKPIResponse,
)
from server.services.underwriting_service import (
    get_underwriting_queue,
    handle_submission_lock,
    record_underwriting_decision,
    get_underwriting_kpis,
)

router = APIRouter(prefix="/api/v1/underwriting", tags=["Underwriting Operations"])


@router.get("/reasons", response_model=List[DeclineReason])
@router.get("/decline-reasons", response_model=List[DeclineReason])
def list_underwriting_decline_reasons():
    """Return list of standardized underwriting decline reasons."""
    return STANDARD_DECLINE_REASONS


@router.get("/queue", response_model=UnderwritingQueueResponse)
def get_review_queue(
    risk_type: Optional[str] = None,
    risk_tier: Optional[str] = None,
    status_filter: Optional[str] = None,
    carrier_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "risk_score",
    sort_order: str = "desc",
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve prioritized, filtered, and sorted underwriter review queue."""
    total, items = get_underwriting_queue(
        db,
        risk_type=risk_type,
        risk_tier=risk_tier,
        status=status_filter,
        carrier_id=carrier_id,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit,
    )
    return UnderwritingQueueResponse(total=total, items=items)


@router.get("/kpi", response_model=UnderwritingKPIResponse)
@router.get("/stats", response_model=UnderwritingKPIResponse)
def get_kpis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get aggregate underwriting workbench KPI metrics."""
    return get_underwriting_kpis(db)


@router.get("/submissions/{submission_id}", response_model=UnderwritingDetailResponse)
def get_underwriting_submission_detail(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full deep-dive submission details with risk breakdown, missing flags, and decision history."""
    submission = (
        db.query(ReinsuranceSubmission)
        .filter(ReinsuranceSubmission.id == submission_id)
        .first()
    )
    if not submission:
        submission = (
            db.query(ReinsuranceSubmission)
            .filter(ReinsuranceSubmission.submission_reference == submission_id)
            .first()
        )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    carrier_name = (
        submission.carrier.company_name
        if submission.carrier and submission.carrier.company_name
        else (submission.carrier.full_name if submission.carrier else "Unknown Carrier")
    )
    carrier_email = submission.carrier.email if submission.carrier else ""

    decisions = (
        db.query(UnderwritingDecision)
        .filter(UnderwritingDecision.submission_id == submission.id)
        .order_by(UnderwritingDecision.created_at.desc())
        .all()
    )

    return UnderwritingDetailResponse(
        submission=submission,
        carrier_name=carrier_name,
        carrier_email=carrier_email,
        decisions=decisions,
    )


@router.post("/submissions/{submission_id}/lock", response_model=LockResponse)
def lock_or_unlock_submission(
    submission_id: str,
    lock_req: LockRequest = LockRequest(action="acquire"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Acquire or release the exclusive 15-minute underwriter review lock."""
    result = handle_submission_lock(
        db, submission_id, current_user, action=lock_req.action
    )
    return LockResponse(**result)


@router.post(
    "/submissions/{submission_id}/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_decision(
    submission_id: str,
    decision_in: DecisionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record a binding Quote or Decline decision on a reinsurance submission."""
    return record_underwriting_decision(db, submission_id, current_user, decision_in)
