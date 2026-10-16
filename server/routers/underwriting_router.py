from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.routers.auth_router import get_current_user, require_underwriter
from server.schemas.decision import DecisionCreate, DecisionResponse
from server.schemas.underwriting import (
    LockRequest,
    LockResponse,
    UnderwritingQueueResponse,
    UnderwritingSubmissionDetail,
)
from server.services.underwriting_service import UnderwritingService

router = APIRouter(prefix="/underwriting", tags=["Underwriting Workbench"])


@router.get("/queue", response_model=UnderwritingQueueResponse)
def get_underwriting_queue(
    risk_type: Optional[str] = Query(None, description="CYBER or D_AND_O"),
    risk_tier: Optional[str] = Query(None, description="LOW, MEDIUM, or HIGH"),
    status: Optional[str] = Query(
        None, description="SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED"
    ),
    search: Optional[str] = Query(None, description="Insured name or reference search"),
    sort_by: str = Query(
        "created_at", description="risk_score, sum_insured, insured_name, created_at"
    ),
    sort_order: str = Query("desc", description="asc or desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, items = UnderwritingService.get_queue(
        db=db,
        risk_type=risk_type,
        risk_tier=risk_tier,
        status=status,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit,
    )
    return UnderwritingQueueResponse(total=total, skip=skip, limit=limit, items=items)


@router.get("/submissions/{submission_id}", response_model=UnderwritingSubmissionDetail)
def get_submission_detail_for_underwriter(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    detail = UnderwritingService.get_submission_detail(
        db=db, submission_id=submission_id
    )
    if not detail:
        raise HTTPException(status_code=404, detail="Submission not found")
    return detail


@router.post("/submissions/{submission_id}/lock", response_model=LockResponse)
def acquire_or_release_lock(
    submission_id: str,
    lock_req: LockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_underwriter),
):
    lock_info = UnderwritingService.set_lock(
        db=db,
        submission_id=submission_id,
        underwriter=current_user,
        action=lock_req.action,
    )
    return LockResponse(**lock_info)


@router.post(
    "/submissions/{submission_id}/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_underwriting_decision(
    submission_id: str,
    decision_data: DecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_underwriter),
):
    decision = UnderwritingService.record_decision(
        db=db,
        submission_id=submission_id,
        underwriter=current_user,
        data=decision_data,
    )
    return DecisionResponse(
        id=decision.id,
        decision_id=decision.id,
        submission_id=decision.submission_id,
        underwriter_id=decision.underwriter_id,
        decision=decision.decision,
        status=decision.submission.status if decision.submission else None,
        capacity_offered=decision.capacity_offered,
        rate_on_line_pct=decision.rate_on_line_pct,
        premium_amount=decision.premium_amount,
        binding_deadline=decision.binding_deadline,
        subjectivities=decision.subjectivities,
        decline_reason_code=decision.decline_reason_code,
        decline_notes=decision.decline_notes,
        decided_at=decision.decided_at,
    )
