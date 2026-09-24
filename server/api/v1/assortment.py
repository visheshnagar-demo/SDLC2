import random
import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Cluster, Scenario, AssortmentPlan, AuditLog
from server.schemas import (
    AssortmentSubmitRequest,
    AssortmentSubmitResponse,
    SkuActionSummary,
    GuardrailResult,
    AuditLogResponse,
)
from server.services.guardrail_service import GuardrailService

router = APIRouter(prefix="/assortment", tags=["assortment"])


@router.post(
    "/submit",
    response_model=AssortmentSubmitResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_assortment_plan(
    payload: AssortmentSubmitRequest, db: Session = Depends(get_db)
):
    # 1. Resolve Cluster
    cluster = (
        db.query(Cluster)
        .filter(
            (Cluster.code == payload.cluster_id) | (Cluster.id == payload.cluster_id)
        )
        .first()
    )
    if not cluster:
        cluster = db.query(Cluster).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster '{payload.cluster_id}' not found.",
        )

    # 2. Resolve Scenario
    scenario = (
        db.query(Scenario).filter(Scenario.id == payload.scenario_id.lower()).first()
    )
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario '{payload.scenario_id}'. Must be one of conservative, balanced, aggressive.",
        )

    # 3. Evaluate Guardrails
    baseline_pb = 28.5
    baseline_util = 96.0
    baseline_in_stock = 96.2

    all_passed, guardrail_results_raw = GuardrailService.evaluate_guardrails(
        baseline_pb_pct=baseline_pb,
        baseline_utilization_pct=baseline_util,
        baseline_in_stock_rate=baseline_in_stock,
        scenario_pb_change_pct=scenario.projected_private_brand_change_pct,
        scenario_utilization_pct=scenario.projected_shelf_utilization_pct,
    )

    # 4. Formulate SKU action summary
    actions_raw = scenario.actions_summary or {}
    grow_cnt = actions_raw.get("grow", 5)
    maintain_cnt = actions_raw.get("maintain", 12)
    swap_cnt = actions_raw.get("swap", 3)
    reduce_cnt = actions_raw.get("reduce", 2)
    total_skus = grow_cnt + maintain_cnt + swap_cnt + reduce_cnt

    action_summary = SkuActionSummary(
        grow_count=grow_cnt,
        maintain_count=maintain_cnt,
        swap_count=swap_cnt,
        reduce_count=reduce_cnt,
        total_skus=total_skus,
    )

    guardrail_results = [GuardrailResult(**r) for r in guardrail_results_raw]

    # 5. Generate Submission ID and Audit Records
    sub_suffix = random.randint(10000, 99999)
    submission_id = f"AUD-2026-{sub_suffix}"
    now_utc = datetime.now(timezone.utc)

    plan = AssortmentPlan(
        id=str(uuid.uuid4()),
        submission_id=submission_id,
        cluster_id=cluster.id,
        scenario_id=scenario.id,
        submitted_by=payload.submitted_by,
        status="APPROVED" if all_passed else "FLAGGED",
        notes=payload.notes,
        sku_action_summary=action_summary.model_dump(),
        guardrail_results=[g.model_dump() for g in guardrail_results],
        created_at=now_utc,
    )
    db.add(plan)
    db.flush()

    audit_log = AuditLog(
        id=str(uuid.uuid4()),
        plan_id=plan.id,
        event_type="ASSORTMENT_SUBMISSION",
        user_id=payload.submitted_by,
        payload={
            "submission_id": submission_id,
            "scenario": scenario.name,
            "cluster_code": cluster.code,
            "category": payload.category,
            "action_summary": action_summary.model_dump(),
            "guardrails": [g.model_dump() for g in guardrail_results],
            "notes": payload.notes,
        },
        created_at=now_utc,
    )
    db.add(audit_log)
    db.commit()

    time_str = now_utc.strftime("%Y-%m-%d %H:%M UTC")
    audit_msg = (
        f"Assortment Plan Submitted Successfully! "
        f"Audit ID: {submission_id} | Scenario: {scenario.name} | Timestamp: {time_str}"
    )

    return AssortmentSubmitResponse(
        submission_id=submission_id,
        status=plan.status,
        scenario_selected=scenario.name,
        cluster_id=cluster.code,
        category=payload.category,
        submitted_by=payload.submitted_by,
        submitted_at=now_utc,
        sku_action_summary=action_summary,
        guardrail_results=guardrail_results,
        audit_trail_message=audit_msg,
    )


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    return [AuditLogResponse.from_orm(l) for l in logs]
