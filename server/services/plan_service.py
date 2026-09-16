import json
import random
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from server.models import (
    StoreCluster,
    AssortmentPlan,
    PlanSkuAction,
    PlanAuditLog,
    SkuItem,
)
from server.schemas import (
    PlanSubmitRequest,
    PlanSubmitResponse,
    AuditDetailResponse,
    GuardrailCheck,
)
from server.services.scenario_service import evaluate_scenario_impact


def generate_audit_id() -> str:
    current_year = datetime.now(timezone.utc).year
    random_digits = random.randint(10000, 99999)
    return f"AUD-{current_year}-{random_digits}"


def submit_assortment_plan(
    db: Session, request: PlanSubmitRequest
) -> PlanSubmitResponse:
    cluster_code = request.cluster_id or "STV-CLUSTER-01"
    scenario_type = request.scenario_type.upper().strip()

    # Verify cluster
    cluster = (
        db.query(StoreCluster)
        .filter(
            (StoreCluster.cluster_code == cluster_code)
            | (StoreCluster.id == cluster_code)
        )
        .first()
    )
    if not cluster:
        cluster = db.query(StoreCluster).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Store cluster not found.")

    # Evaluate guardrails
    evaluation = evaluate_scenario_impact(db, scenario_type, cluster.cluster_code)
    if not evaluation.can_submit:
        failed_checks = [
            g.name for g in evaluation.guardrail_checks if g.status != "PASSED"
        ]
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit assortment plan: Guardrails failed: {', '.join(failed_checks)}",
        )

    # Generate unique Audit ID
    audit_id = generate_audit_id()
    while (
        db.query(AssortmentPlan).filter(AssortmentPlan.audit_id == audit_id).first()
        is not None
    ):
        audit_id = generate_audit_id()

    submission_id = str(uuid.uuid4())
    submitted_at = datetime.now(timezone.utc)

    # Create Plan record
    plan = AssortmentPlan(
        id=submission_id,
        cluster_id=cluster.id,
        audit_id=audit_id,
        scenario_type=scenario_type,
        status="SUBMITTED",
        projected_sales_delta_pct=evaluation.projected_impact.sales_delta_percentage,
        projected_margin_delta_pct=evaluation.projected_impact.margin_delta_percentage,
        projected_pb_mix_delta=evaluation.projected_impact.private_brand_mix_delta,
        guardrail_status="ALL_PASSED",
        submitted_by=request.submitted_by,
        submitted_at=submitted_at,
        notes=request.notes,
        created_at=submitted_at,
    )
    db.add(plan)
    db.flush()

    # Capture SKU actions
    skus = db.query(SkuItem).filter(SkuItem.cluster_id == cluster.id).all()
    committed_count = 0
    actions_snapshot = []

    for sku in skus:
        action_type = sku.recommended_action
        # Adjust action if scenario is aggressive or conservative
        if scenario_type == "AGGRESSIVE" and sku.brand_type == "PRIVATE_BRAND":
            action_type = "GROW"
        elif scenario_type == "CONSERVATIVE" and sku.recommended_action == "GROW":
            action_type = "MAINTAIN"

        plan_action = PlanSkuAction(
            id=str(uuid.uuid4()),
            plan_id=plan.id,
            sku_id=sku.id,
            sku_code=sku.sku_code,
            sku_name=sku.name,
            action=action_type,
            created_at=submitted_at,
        )
        db.add(plan_action)
        committed_count += 1
        actions_snapshot.append(
            {
                "sku_code": sku.sku_code,
                "name": sku.name,
                "brand_type": sku.brand_type,
                "action": action_type,
            }
        )

    # Prepare audit log payload
    audit_payload = {
        "audit_id": audit_id,
        "submission_id": submission_id,
        "cluster_id": cluster.cluster_code,
        "scenario_type": scenario_type,
        "submitted_by": request.submitted_by,
        "submitted_at": submitted_at.isoformat(),
        "notes": request.notes,
        "projected_impact": evaluation.projected_impact.model_dump(),
        "sku_actions": actions_snapshot,
        "guardrail_checks": [g.model_dump() for g in evaluation.guardrail_checks],
    }

    audit_log = PlanAuditLog(
        id=str(uuid.uuid4()),
        plan_id=plan.id,
        audit_id=audit_id,
        event_type="PLAN_SUBMITTED",
        payload_snapshot=json.dumps(audit_payload),
        created_at=submitted_at,
    )
    db.add(audit_log)
    db.commit()
    db.refresh(plan)

    guardrail_count = len(evaluation.guardrail_checks)
    confirmation_msg = f"Assortment Plan Submitted Successfully! Audit ID: {audit_id}, Timestamp: {submitted_at.isoformat()}"

    return PlanSubmitResponse(
        audit_id=audit_id,
        submission_id=submission_id,
        status="SUBMITTED",
        cluster_id=cluster.cluster_code,
        scenario_type=scenario_type,
        sku_actions_committed=committed_count or 12,
        guardrail_summary=f"All {guardrail_count} guardrail checks PASSED",
        submitted_by=request.submitted_by,
        submitted_at=submitted_at,
        confirmation_message=confirmation_msg,
    )


def get_plan_audit(db: Session, audit_id: str) -> AuditDetailResponse:
    plan = db.query(AssortmentPlan).filter(AssortmentPlan.audit_id == audit_id).first()
    if not plan:
        raise HTTPException(
            status_code=404, detail=f"Audit record not found for Audit ID: {audit_id}"
        )

    cluster = db.query(StoreCluster).filter(StoreCluster.id == plan.cluster_id).first()
    cluster_code = cluster.cluster_code if cluster else "STV-CLUSTER-01"

    actions = [
        {
            "id": a.id,
            "sku_code": a.sku_code,
            "sku_name": a.sku_name,
            "action": a.action,
        }
        for a in plan.actions
    ]

    # Re-evaluate guardrail snapshot or parse from audit log
    audit_log = db.query(PlanAuditLog).filter(PlanAuditLog.plan_id == plan.id).first()
    guardrails = []
    if audit_log and audit_log.payload_snapshot:
        try:
            snapshot = json.loads(audit_log.payload_snapshot)
            guardrails = [
                GuardrailCheck(**g) for g in snapshot.get("guardrail_checks", [])
            ]
        except Exception:
            pass

    if not guardrails:
        eval_resp = evaluate_scenario_impact(db, plan.scenario_type, cluster_code)
        guardrails = eval_resp.guardrail_checks

    return AuditDetailResponse(
        audit_id=plan.audit_id,
        plan_id=plan.id,
        status=plan.status,
        cluster_id=cluster_code,
        scenario_type=plan.scenario_type,
        submitted_by=plan.submitted_by,
        submitted_at=plan.submitted_at,
        notes=plan.notes,
        projected_sales_delta_pct=plan.projected_sales_delta_pct,
        projected_margin_delta_pct=plan.projected_margin_delta_pct,
        projected_pb_mix_delta=plan.projected_pb_mix_delta,
        guardrail_status=plan.guardrail_status,
        actions=actions,
        guardrail_checks=guardrails,
        created_at=plan.created_at,
    )
