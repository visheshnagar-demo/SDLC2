from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import UnderwritingQueueResponse
from server.services.queue_service import QueueService

router = APIRouter(prefix="/api/v1/underwriting/queue", tags=["Underwriting Queue"])


@router.get(
    "",
    response_model=UnderwritingQueueResponse,
    status_code=status.HTTP_200_OK,
    summary="Query underwriter review queue with filters, sorting, and pagination",
)
def get_underwriter_queue(
    status: Optional[str] = Query(
        None, description="Filter by status (SUBMITTED, UNDER_REVIEW, QUOTED, DECLINED)"
    ),
    risk_category: Optional[str] = Query(
        None, description="Filter by risk category (CYBER, DO)"
    ),
    priority: Optional[str] = Query(
        None, description="Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)"
    ),
    carrier_name: Optional[str] = Query(
        None, description="Filter by carrier name substring"
    ),
    search: Optional[str] = Query(
        None, description="Search by reference, insured entity, or policy number"
    ),
    sort_by: str = Query(
        "created_at",
        description="Field to sort by (created_at, risk_score, priority, policy_limit_usd)",
    ),
    sort_order: str = Query("desc", description="Sort order (asc, desc)"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max items to return"),
    db: Session = Depends(get_db),
):
    return QueueService.get_underwriting_queue(
        db=db,
        status=status,
        risk_category=risk_category,
        priority=priority,
        search=search,
        carrier_name=carrier_name,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit,
    )
