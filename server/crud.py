from datetime import datetime, timezone
import random
from typing import List, Optional
from sqlalchemy.orm import Session
from server.models import KPIModel, SKUModel, ScenarioModel, AssortmentPlanModel
from server.schemas import (
    KPISummaryResponse,
    ShelfCapacitySchema,
    KPIMetricDetail,
    SKUResponse,
    SKUCreate,
    SKUActionItem,
    ScenarioCalculateResponse,
    GuardrailStatus,
    SKUActionSummary,
    AssortmentPlanSubmitRequest,
)


def get_kpi_summary(db: Session) -> KPISummaryResponse:
    kpis = db.query(KPIModel).all()
    kpi_dict = {k.metric_name: k for k in kpis}

    sales_kpi = kpi_dict.get("sales_per_linear_ft")
    pb_kpi = kpi_dict.get("private_brand_percentage")
    stock_kpi = kpi_dict.get("in_stock_rate")
    shelf_kpi = kpi_dict.get("shelf_capacity")

    sales_val = sales_kpi.value if sales_kpi else 428.50
    pb_val = pb_kpi.value if pb_kpi else 24.5
    stock_val = stock_kpi.value if stock_kpi else 96.8
    shelf_val = shelf_kpi.value if shelf_kpi else 142.0
    shelf_target = (
        shelf_kpi.target_value if shelf_kpi and shelf_kpi.target_value else 150.0
    )

    utilization = (
        round((shelf_val / shelf_target) * 100.0, 1) if shelf_target > 0 else 94.6
    )

    metrics_list = [
        KPIMetricDetail(
            id=k.id,
            metric_name=k.metric_name,
            value=k.value,
            unit=k.unit,
            target_value=k.target_value,
            status_text=k.status_text,
        )
        for k in kpis
    ]

    return KPISummaryResponse(
        sales_per_linear_ft=sales_val,
        private_brand_percentage=pb_val,
        in_stock_rate=stock_val,
        shelf_capacity=ShelfCapacitySchema(
            current=shelf_val,
            total=shelf_target,
            unit="LF",
            utilization_percentage=utilization,
        ),
        metrics=metrics_list,
    )


def get_skus(
    db: Session,
    category: Optional[str] = None,
    action: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[SKUResponse]:
    query = db.query(SKUModel)
    if category:
        query = query.filter(SKUModel.category.ilike(category))
    if action:
        query = query.filter(SKUModel.recommended_action.ilike(action))

    skus = query.offset(skip).limit(limit).all()
    results = []
    for s in skus:
        results.append(
            SKUResponse(
                id=s.id,
                sku_id=s.sku_id,
                name=s.name,
                category=s.category,
                sales=s.sales,
                movement=s.movement,
                margin_percentage=s.margin_percentage,
                velocity=s.velocity,
                recommended_action=s.recommended_action,
                action=s.recommended_action,
            )
        )
    return results


def get_sku_by_id(db: Session, sku_id: str) -> Optional[SKUModel]:
    return (
        db.query(SKUModel)
        .filter((SKUModel.sku_id == sku_id) | (SKUModel.id == sku_id))
        .first()
    )


def create_sku(db: Session, sku_in: SKUCreate) -> SKUModel:
    db_sku = SKUModel(
        sku_id=sku_in.sku_id,
        name=sku_in.name,
        category=sku_in.category,
        sales=sku_in.sales,
        movement=sku_in.movement,
        margin_percentage=sku_in.margin_percentage,
        velocity=sku_in.velocity,
        recommended_action=sku_in.recommended_action,
    )
    db.add(db_sku)
    db.commit()
    db.refresh(db_sku)
    return db_sku


def get_scenarios(db: Session) -> List[ScenarioModel]:
    return db.query(ScenarioModel).all()


def calculate_scenario_impact(
    db: Session,
    scenario_type: str,
    current_skus: Optional[List[SKUActionItem]] = None,
) -> ScenarioCalculateResponse:
    scenario_type_clean = scenario_type.capitalize() if scenario_type else "Balanced"

    if scenario_type_clean == "Conservative":
        sales_pct = 3.5
        pb_pct = 0.8
        shelf_pct = 92.0
        summary = SKUActionSummary(add=1, keep=14, swap=1, reduce=1)
    elif scenario_type_clean == "Aggressive":
        sales_pct = 14.2
        pb_pct = 3.2
        shelf_pct = 98.5
        summary = SKUActionSummary(add=6, keep=9, swap=4, reduce=2)
    else:  # Balanced
        scenario_type_clean = "Balanced"
        sales_pct = 7.8
        pb_pct = 1.5
        shelf_pct = 95.0
        summary = SKUActionSummary(add=3, keep=12, swap=2, reduce=1)

    # If current_skus provided, adjust summary counts accordingly
    if current_skus:
        add_count = 0
        keep_count = 0
        swap_count = 0
        reduce_count = 0
        for s in current_skus:
            act = s.action.upper()
            if act in ("GROW", "ADD"):
                add_count += 1
            elif act in ("MAINTAIN", "KEEP"):
                keep_count += 1
            elif act == "SWAP":
                swap_count += 1
            elif act == "REDUCE":
                reduce_count += 1
        if add_count or keep_count or swap_count or reduce_count:
            summary = SKUActionSummary(
                add=add_count,
                keep=keep_count,
                swap=swap_count,
                reduce=reduce_count,
            )

    guardrails = GuardrailStatus(
        private_brand_goal_met=True,
        shelf_capacity_compliant=shelf_pct <= 100.0,
        in_stock_sla_met=True,
    )

    return ScenarioCalculateResponse(
        scenario_type=scenario_type_clean,
        projected_sales_increase_percentage=sales_pct,
        private_brand_change_percentage=pb_pct,
        shelf_utilization_change_percentage=shelf_pct,
        guardrail_status=guardrails,
        sku_action_summary=summary,
    )


def create_assortment_plan(
    db: Session,
    req: AssortmentPlanSubmitRequest,
) -> AssortmentPlanModel:
    scenario = req.scenario_selected or req.scenario_type or "Balanced"
    calc = calculate_scenario_impact(db, scenario, req.sku_actions)

    now = datetime.now(timezone.utc)
    suffix = random.randint(10000, 99999)
    audit_id = f"AT-{now.year}-{suffix}"

    sku_actions_list = [
        {"sku_id": a.sku_id, "action": a.action} for a in (req.sku_actions or [])
    ]

    plan = AssortmentPlanModel(
        audit_id=audit_id,
        user_id=req.user_id or "Marcus Vance",
        cluster_id=req.cluster_id or "STV-042",
        scenario_selected=scenario,
        sku_action_summary=calc.sku_action_summary.model_dump(),
        detailed_sku_actions=sku_actions_list,
        guardrail_status=calc.guardrail_status.model_dump(),
        submission_timestamp=now,
        status="SUBMITTED",
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def get_assortment_plans(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> List[AssortmentPlanModel]:
    return (
        db.query(AssortmentPlanModel)
        .order_by(AssortmentPlanModel.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_assortment_plan_by_audit_id(
    db: Session,
    audit_id: str,
) -> Optional[AssortmentPlanModel]:
    clean_id = audit_id.lstrip("#")
    return (
        db.query(AssortmentPlanModel)
        .filter(
            (AssortmentPlanModel.audit_id == clean_id)
            | (AssortmentPlanModel.audit_id == audit_id)
            | (AssortmentPlanModel.id == audit_id)
        )
        .first()
    )
