from fastapi import APIRouter, Depends, Body, Path, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    PlanSubmitRequest,
    PlanSubmitResponse,
    AuditDetailResponse,
)
from server.services.plan_service import submit_assortment_plan, get_plan_audit

router = APIRouter(tags=["Assortment Plans & Audit"])


@router.post(
    "/api/v1/plans/submit",
    response_model=PlanSubmitResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_plan_endpoint(
    request: PlanSubmitRequest = Body(...),
    db: Session = Depends(get_db),
):
    """
    Submit approved assortment plan, validate guardrails, and generate audit trail record.
    """
    return submit_assortment_plan(db=db, request=request)


@router.get("/api/v1/plans/audit/{audit_id}", response_model=AuditDetailResponse)
def get_plan_audit_endpoint(
    audit_id: str = Path(..., description="Audit ID (e.g., AUD-2026-99482)"),
    db: Session = Depends(get_db),
):
    """
    Retrieve audit-trail record by Audit ID.
    """
    return get_plan_audit(db=db, audit_id=audit_id)
