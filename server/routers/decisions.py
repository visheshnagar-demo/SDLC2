from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    UnderwritingDecisionCreate,
    UnderwritingDecisionResponse,
    ResolveFlagRequest,
    SubmissionMissingFlagResponse,
)
from server.services.decision_service import DecisionService

router = APIRouter(
    prefix="/api/v1/underwriting", tags=["Underwriting Decisions & Flags"]
)


@router.post(
    "/decisions",
    response_model=UnderwritingDecisionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record binding quote or decline decision with audit logging",
)
def record_underwriting_decision(
    payload: UnderwritingDecisionCreate,
    db: Session = Depends(get_db),
):
    return DecisionService.record_decision(db, payload)


@router.patch(
    "/flags/{flag_id}/resolve",
    response_model=SubmissionMissingFlagResponse,
    status_code=status.HTTP_200_OK,
    summary="Resolve a missing information flag",
)
def resolve_missing_info_flag_patch(
    flag_id: str,
    payload: ResolveFlagRequest,
    db: Session = Depends(get_db),
):
    flag = DecisionService.resolve_flag(db, flag_id, payload.underwriter_id)
    return flag


@router.post(
    "/flags/{flag_id}/resolve",
    response_model=SubmissionMissingFlagResponse,
    status_code=status.HTTP_200_OK,
    summary="Resolve a missing information flag (POST alias)",
)
def resolve_missing_info_flag_post(
    flag_id: str,
    payload: ResolveFlagRequest,
    db: Session = Depends(get_db),
):
    flag = DecisionService.resolve_flag(db, flag_id, payload.underwriter_id)
    return flag
