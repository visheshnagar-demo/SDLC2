from typing import Optional
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.schemas.compliance import (
    ComplianceApplicationListResponse,
    ComplianceApplicationDetailResponse,
    ComplianceDecisionRequest,
    ComplianceDecisionResponse,
)
from server.services.compliance_service import (
    list_compliance_applications,
    get_compliance_application_detail,
    record_compliance_decision,
)
from server.dependencies import require_role, get_client_ip

router = APIRouter(prefix="/api/v1/compliance", tags=["Compliance Review"])


@router.get(
    "/applications",
    response_model=ComplianceApplicationListResponse,
    dependencies=[Depends(require_role(["compliance_officer", "admin"]))],
)
def list_applications(
    status: Optional[str] = Query(
        None,
        description="Filter by overall status (FLAGGED, APPROVED, REJECTED, AUTO_VERIFIED)",
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total, items = list_compliance_applications(
        db=db,
        status_filter=status,
        skip=skip,
        limit=limit,
    )
    return ComplianceApplicationListResponse(total=total, items=items)


@router.get(
    "/applications/{application_id}",
    response_model=ComplianceApplicationDetailResponse,
    dependencies=[Depends(require_role(["compliance_officer", "admin"]))],
)
def get_application(
    application_id: str,
    db: Session = Depends(get_db),
):
    detail = get_compliance_application_detail(db, application_id)
    return ComplianceApplicationDetailResponse(**detail)


@router.post(
    "/applications/{application_id}/decision",
    response_model=ComplianceDecisionResponse,
    status_code=status.HTTP_200_OK,
)
def submit_decision(
    application_id: str,
    req: ComplianceDecisionRequest,
    request: Request,
    current_user: User = Depends(require_role(["compliance_officer", "admin"])),
    db: Session = Depends(get_db),
):
    review = record_compliance_decision(
        db=db,
        application_id=application_id,
        officer_id=current_user.id,
        decision=req.decision,
        notes=req.notes,
        reason_code=req.reason_code,
        client_ip=get_client_ip(request),
    )

    return ComplianceDecisionResponse(
        review_id=review.id,
        application_id=review.application_id,
        decision=review.decision,
        reason_code=review.reason_code,
        notes=review.notes,
        timestamp=review.created_at,
    )
