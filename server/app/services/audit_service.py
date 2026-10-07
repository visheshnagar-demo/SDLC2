import uuid
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.approval import AssortmentApproval
from app.schemas.approval import ApprovalRequest, ApprovalResponse
from app.services.assortment_service import get_cluster_by_identifier
from app.services.scenario_engine import calculate_scenario_impact


def generate_audit_ref() -> str:
    current_year = datetime.now(timezone.utc).year
    rand_suffix = f"{random.randint(1000, 9999)}"
    return f"AUD-{current_year}-STV-{rand_suffix}"


def create_assortment_approval(
    db: Session, request: ApprovalRequest
) -> ApprovalResponse:
    cluster = get_cluster_by_identifier(db, request.cluster_id)
    impact = calculate_scenario_impact(db, request.scenario_key, cluster.id)

    if not impact.can_submit:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve scenario: one or more critical guardrails failed.",
        )

    approval_id = str(uuid.uuid4())
    audit_ref = generate_audit_ref()
    approved_time = datetime.now(timezone.utc)

    sku_action_metrics = {
        "grow_count": impact.sku_action_summary.grow_count,
        "maintain_count": impact.sku_action_summary.maintain_count,
        "swap_count": impact.sku_action_summary.swap_count,
        "reduce_count": impact.sku_action_summary.reduce_count,
    }

    projected_impact = {
        "sales_lift_pct": f"+{impact.projected_sales_lift_pct}%",
        "private_brand_share": f"{impact.projected_pb_share_pct}%",
        "shelf_capacity": f"{impact.projected_shelf_capacity_pct}%",
        "instock_rate": f"{impact.projected_instock_rate_pct}%",
    }

    approval_rec = AssortmentApproval(
        id=approval_id,
        cluster_id=cluster.id,
        scenario_name=impact.scenario_name,
        manager_user_id=request.manager_user_id or "MGR-DG-8812",
        manager_email=request.manager_email or "category.manager@dollargeneral.com",
        audit_ref_id=audit_ref,
        status="APPROVED",
        guardrail_results_json=[g.model_dump() for g in impact.guardrails],
        sku_actions_json=sku_action_metrics,
        projected_impact_json=projected_impact,
        notes=request.notes,
        approved_at=approved_time,
    )

    db.add(approval_rec)
    db.commit()
    db.refresh(approval_rec)

    return ApprovalResponse(
        approval_id=approval_rec.id,
        audit_reference_id=approval_rec.audit_ref_id,
        cluster_id=cluster.cluster_code,
        approved_scenario=impact.scenario_name.split()[0],  # e.g., "Balanced"
        status=approval_rec.status,
        approved_at=approved_time.isoformat(),
        manager_user_id=approval_rec.manager_user_id,
        manager_email=approval_rec.manager_email,
        sku_action_metrics=sku_action_metrics,
        projected_impact=projected_impact,
        message="Assortment scenario successfully approved and locked for execution.",
    )
