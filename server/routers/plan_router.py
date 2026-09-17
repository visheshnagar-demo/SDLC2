from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.services.approval_service import ApprovalService
from server.schemas.plan import (
    AssortmentPlanSubmitRequest,
    AssortmentPlanResponse,
)

router = APIRouter(prefix="/assortment-plans", tags=["Assortment Plans"])


@router.post(
    "/submit",
    response_model=AssortmentPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_plan(req: AssortmentPlanSubmitRequest, db: Session = Depends(get_db)):
    """Commit and approve selected assortment plan with audit log."""
    return ApprovalService.submit_plan(db, req)


@router.get("/{audit_id}", response_model=AssortmentPlanResponse)
def get_plan(audit_id: str, db: Session = Depends(get_db)):
    """Retrieve historical audit trail record by audit ID or plan ID."""
    plan = ApprovalService.get_plan_by_audit_id(db, audit_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assortment plan with audit ID '{audit_id}' not found",
        )
    return plan
