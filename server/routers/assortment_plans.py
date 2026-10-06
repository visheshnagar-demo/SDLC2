from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    AssortmentPlanSubmitRequest,
    AssortmentPlanSubmitResponse,
)
from server import crud

router = APIRouter(prefix="/api/v1/assortment-plans", tags=["Assortment Plans"])


def _format_plan_response(plan) -> AssortmentPlanSubmitResponse:
    ts_str = (
        plan.submission_timestamp.isoformat()
        if hasattr(plan.submission_timestamp, "isoformat")
        else str(plan.submission_timestamp)
    )
    audit_display = (
        f"#{plan.audit_id}" if not plan.audit_id.startswith("#") else plan.audit_id
    )
    return AssortmentPlanSubmitResponse(
        id=plan.id,
        audit_id=plan.audit_id,
        timestamp=ts_str,
        submission_timestamp=ts_str,
        user_id=plan.user_id,
        cluster_id=plan.cluster_id,
        scenario_selected=plan.scenario_selected,
        sku_action_summary=plan.sku_action_summary or {},
        detailed_sku_actions=plan.detailed_sku_actions or [],
        guardrail_status=plan.guardrail_status or {},
        status=plan.status,
        message=f"Assortment Update Submitted Successfully. Audit Trail ID: {audit_display}. Changes logged to central planogram repository.",
    )


@router.post(
    "/submit",
    response_model=AssortmentPlanSubmitResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "", response_model=AssortmentPlanSubmitResponse, status_code=status.HTTP_201_CREATED
)
@router.post(
    "/",
    response_model=AssortmentPlanSubmitResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_assortment_plan(
    request: AssortmentPlanSubmitRequest,
    db: Session = Depends(get_db),
):
    """Submit the selected assortment plan with scenario and SKU actions, creating an audit trail."""
    plan = crud.create_assortment_plan(db, request)
    return _format_plan_response(plan)


@router.get("", response_model=List[AssortmentPlanSubmitResponse])
@router.get("/", response_model=List[AssortmentPlanSubmitResponse])
def get_assortment_plans(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Retrieve list of submitted assortment plans."""
    plans = crud.get_assortment_plans(db, skip=skip, limit=limit)
    return [_format_plan_response(p) for p in plans]


@router.get("/{audit_id}", response_model=AssortmentPlanSubmitResponse)
def get_assortment_plan(audit_id: str, db: Session = Depends(get_db)):
    """Retrieve a specific assortment plan by audit ID or record ID."""
    plan = crud.get_assortment_plan_by_audit_id(db, audit_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assortment plan with audit ID '{audit_id}' not found",
        )
    return _format_plan_response(plan)
