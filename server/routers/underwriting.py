from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.submission import SubmissionListResponse
from server.schemas.decision import DeclineReason, DecisionCreate, DecisionResponse
from server.services.submission_service import SubmissionService
from server.services.decision_service import DecisionService

router = APIRouter(prefix="/api/v1/underwriting", tags=["Underwriting"])


@router.get(
    "/reasons",
    response_model=List[DeclineReason],
    summary="Get master decline reasons catalogue",
)
@router.get("/reasons/", response_model=List[DeclineReason], include_in_schema=False)
def get_decline_reasons():
    return DecisionService.get_decline_reasons()


@router.get(
    "/decline-reasons",
    response_model=List[DeclineReason],
    summary="Get master decline reasons catalogue (alias)",
)
@router.get(
    "/decline-reasons/", response_model=List[DeclineReason], include_in_schema=False
)
def get_decline_reasons_explicit():
    return DecisionService.get_decline_reasons()


@router.get(
    "/queue",
    response_model=SubmissionListResponse,
    summary="Underwriter review queue",
)
@router.get("/queue/", response_model=SubmissionListResponse, include_in_schema=False)
@router.get(
    "/submissions",
    response_model=SubmissionListResponse,
    summary="Underwriter review queue submissions list",
)
@router.get(
    "/submissions/", response_model=SubmissionListResponse, include_in_schema=False
)
@router.get(
    "/review-queue",
    response_model=SubmissionListResponse,
    summary="Underwriter review queue alias",
)
def get_underwriter_queue(
    risk_type: Optional[str] = Query(
        None, description="Filter by risk category (CYBER, DO, Cyber, D&O)"
    ),
    status: Optional[str] = Query(
        None, description="Filter by status (PENDING, QUOTED, DECLINED)"
    ),
    min_score: Optional[float] = Query(
        None, description="Minimum risk score threshold"
    ),
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    items, total = SubmissionService.list_submissions(
        db=db,
        risk_type=risk_type,
        status_filter=status,
        min_score=min_score,
        skip=skip,
        limit=limit,
    )
    return SubmissionListResponse(items=items, total=total, skip=skip, limit=limit)


@router.post(
    "/submissions/{submission_id}/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Quote or Decline decision via underwriting namespace",
)
@router.post(
    "/submissions/{submission_id}/decision",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@router.post(
    "/submissions/{submission_id}/decisions/",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def record_decision_underwriting(
    submission_id: str, payload: DecisionCreate, db: Session = Depends(get_db)
):
    decision = DecisionService.record_decision(
        db=db, submission_id=submission_id, data=payload
    )
    return decision


@router.post(
    "/submissions/{submission_id}/quote",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def record_quote_underwriting(
    submission_id: str, payload: DecisionCreate, db: Session = Depends(get_db)
):
    payload.decision_type = "QUOTE"
    decision = DecisionService.record_decision(
        db=db, submission_id=submission_id, data=payload
    )
    return decision


@router.post(
    "/submissions/{submission_id}/decline",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def record_decline_underwriting(
    submission_id: str, payload: DecisionCreate, db: Session = Depends(get_db)
):
    payload.decision_type = "DECLINE"
    decision = DecisionService.record_decision(
        db=db, submission_id=submission_id, data=payload
    )
    return decision


@router.post(
    "/decisions",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record decision with submission_id in payload",
)
@router.post(
    "/decisions/",
    response_model=DecisionResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def record_decision_with_body(payload: DecisionCreate, db: Session = Depends(get_db)):
    if not payload.submission_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="submission_id is required in decision payload when posting to root decisions endpoint",
        )
    decision = DecisionService.record_decision(
        db=db, submission_id=payload.submission_id, data=payload
    )
    return decision
