from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from server.models import ScenarioConfig, StoreCluster
from server.schemas import (
    ScenarioListResponse,
    ScenarioOptionResponse,
    ScenarioEvaluateResponse,
    ProjectedImpact,
    SkuActionSummary,
    GuardrailCheck,
)


def get_all_scenarios(db: Session) -> ScenarioListResponse:
    scenarios = db.query(ScenarioConfig).order_by(ScenarioConfig.created_at.asc()).all()
    if not scenarios:
        # If not seeded yet, seed or return defaults
        from server.database import seed_data

        seed_data(db)
        scenarios = (
            db.query(ScenarioConfig).order_by(ScenarioConfig.created_at.asc()).all()
        )

    items = [
        ScenarioOptionResponse(
            id=s.id,
            scenario_type=s.scenario_type,
            scenario_name=s.scenario_name,
            description=s.description,
            is_default=s.is_default,
            sales_delta_percentage=s.sales_delta_percentage,
            margin_delta_percentage=s.margin_delta_percentage,
            private_brand_mix_delta=s.private_brand_mix_delta,
            shelf_capacity_projected_percentage=s.shelf_capacity_projected_percentage,
        )
        for s in scenarios
    ]
    return ScenarioListResponse(total_count=len(items), scenarios=items)


def evaluate_scenario_impact(
    db: Session,
    scenario_type_raw: str,
    cluster_id_or_code: str = "STV-CLUSTER-01",
) -> ScenarioEvaluateResponse:
    scenario_type = scenario_type_raw.upper().strip()
    valid_scenarios = ["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]
    if scenario_type not in valid_scenarios:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid scenario_type: '{scenario_type_raw}'. Must be one of {valid_scenarios}.",
        )

    config = (
        db.query(ScenarioConfig)
        .filter(ScenarioConfig.scenario_type == scenario_type)
        .first()
    )
    if not config:
        # Fallback preset defaults
        preset_map = {
            "CONSERVATIVE": {
                "name": "Conservative Stability",
                "sales_delta": 2.1,
                "margin_delta": 1.2,
                "pb_mix_delta": 1.0,
                "shelf_capacity": 86.0,
            },
            "BALANCED": {
                "name": "Balanced Optimization",
                "sales_delta": 5.4,
                "margin_delta": 2.4,
                "pb_mix_delta": 2.5,
                "shelf_capacity": 89.5,
            },
            "AGGRESSIVE": {
                "name": "Aggressive Growth",
                "sales_delta": 8.5,
                "margin_delta": 3.1,
                "pb_mix_delta": 4.2,
                "shelf_capacity": 92.5,
            },
        }
        preset = preset_map[scenario_type]
        sales_delta = preset["sales_delta"]
        margin_delta = preset["margin_delta"]
        pb_mix_delta = preset["pb_mix_delta"]
        shelf_capacity = preset["shelf_capacity"]
        scenario_name = preset["name"]
    else:
        sales_delta = config.sales_delta_percentage
        margin_delta = config.margin_delta_percentage
        pb_mix_delta = config.private_brand_mix_delta
        shelf_capacity = config.shelf_capacity_projected_percentage
        scenario_name = config.scenario_name

    # Fetch cluster for baseline metrics
    cluster = (
        db.query(StoreCluster)
        .filter(
            (StoreCluster.cluster_code == cluster_id_or_code)
            | (StoreCluster.id == cluster_id_or_code)
        )
        .first()
    )
    base_pb_pct = cluster.private_brand_pct if cluster else 32.0

    # SKU distribution per scenario
    if scenario_type == "AGGRESSIVE":
        sku_summary = SkuActionSummary(
            grow_count=5,
            maintain_count=4,
            swap_count=2,
            reduce_count=1,
            total_actions=12,
        )
        projected_margin = 35.1
        projected_pb = base_pb_pct + pb_mix_delta
    elif scenario_type == "CONSERVATIVE":
        sku_summary = SkuActionSummary(
            grow_count=2,
            maintain_count=6,
            swap_count=2,
            reduce_count=2,
            total_actions=12,
        )
        projected_margin = 33.2
        projected_pb = base_pb_pct + pb_mix_delta
    else:  # BALANCED
        sku_summary = SkuActionSummary(
            grow_count=3,
            maintain_count=4,
            swap_count=3,
            reduce_count=2,
            total_actions=12,
        )
        projected_margin = 34.4
        projected_pb = base_pb_pct + pb_mix_delta

    # Evaluate Guardrail checks
    # 1. Minimum Margin Threshold (>= 28.0%)
    margin_passed = projected_margin >= 28.0
    # 2. Private Brand Target (>= 30.0%)
    pb_passed = projected_pb >= 30.0
    # 3. Max Shelf Capacity (<= 95.0%)
    shelf_passed = shelf_capacity <= 95.0

    guardrails: List[GuardrailCheck] = [
        GuardrailCheck(
            name="Minimum Margin Threshold (>= 28%)",
            status="PASSED" if margin_passed else "FAILED",
            current_value=f"{projected_margin:.1f}%",
            threshold=">= 28.0%",
        ),
        GuardrailCheck(
            name="Private Brand Target (>= 30%)",
            status="PASSED" if pb_passed else "FAILED",
            current_value=f"{projected_pb:.1f}%",
            threshold=">= 30.0%",
        ),
        GuardrailCheck(
            name="Max Shelf Capacity Utilization (<= 95%)",
            status="PASSED" if shelf_passed else "FAILED",
            current_value=f"{shelf_capacity:.1f}%",
            threshold="<= 95.0%",
        ),
    ]

    all_passed = all(g.status == "PASSED" for g in guardrails)

    return ScenarioEvaluateResponse(
        scenario_type=scenario_type,
        scenario_name=scenario_name,
        projected_impact=ProjectedImpact(
            sales_delta_percentage=sales_delta,
            margin_delta_percentage=margin_delta,
            private_brand_mix_delta=pb_mix_delta,
            shelf_capacity_projected_percentage=shelf_capacity,
        ),
        sku_action_summary=sku_summary,
        guardrail_checks=guardrails,
        can_submit=all_passed,
    )
