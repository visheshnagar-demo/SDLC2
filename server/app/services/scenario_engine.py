from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.sku import Sku
from app.models.scenario import Scenario
from app.schemas.scenario import (
    ScenarioImpactResponse,
    SkuActionSummary,
)
from app.services.assortment_service import get_cluster_by_identifier
from app.services.guardrail_service import evaluate_guardrails

SCENARIO_CONFIGS = {
    "conservative": {
        "scenario_key": "conservative",
        "scenario_name": "Conservative Assortment Strategy",
        "projected_sales_lift_pct": 1.8,
        "projected_sales_per_linear_ft": 188.84,
        "projected_pb_share_pct": 29.5,
        "projected_instock_rate_pct": 98.0,
        "projected_shelf_capacity_pct": 96.0,
        "sku_actions": {"grow": 3, "maintain": 15, "swap": 2, "reduce": 2},
    },
    "balanced": {
        "scenario_key": "balanced",
        "scenario_name": "Balanced Assortment Strategy",
        "projected_sales_lift_pct": 4.5,
        "projected_sales_per_linear_ft": 193.85,
        "projected_pb_share_pct": 32.5,
        "projected_instock_rate_pct": 96.5,
        "projected_shelf_capacity_pct": 99.0,
        "sku_actions": {"grow": 5, "maintain": 12, "swap": 3, "reduce": 2},
    },
    "aggressive": {
        "scenario_key": "aggressive",
        "scenario_name": "Aggressive Assortment Strategy",
        "projected_sales_lift_pct": 7.8,
        "projected_sales_per_linear_ft": 199.97,
        "projected_pb_share_pct": 36.0,
        "projected_instock_rate_pct": 95.1,
        "projected_shelf_capacity_pct": 100.0,
        "sku_actions": {"grow": 7, "maintain": 9, "swap": 4, "reduce": 2},
    },
}


def calculate_scenario_impact(
    db: Session,
    scenario_key: str,
    cluster_id_or_code: Optional[str] = None,
) -> ScenarioImpactResponse:
    cluster = get_cluster_by_identifier(db, cluster_id_or_code)
    clean_key = scenario_key.lower().strip()

    if clean_key not in SCENARIO_CONFIGS:
        # Check if stored in DB scenario table
        db_scen = (
            db.query(Scenario)
            .filter(
                Scenario.cluster_id == cluster.id,
                Scenario.scenario_key == clean_key,
            )
            .first()
        )
        if not db_scen:
            raise HTTPException(
                status_code=404,
                detail=f"Scenario '{scenario_key}' not found for cluster '{cluster.cluster_code}'",
            )
        cfg = {
            "scenario_key": db_scen.scenario_key,
            "scenario_name": db_scen.name,
            "projected_sales_lift_pct": float(db_scen.projected_sales_lift),
            "projected_sales_per_linear_ft": round(
                185.50 * (1 + float(db_scen.projected_sales_lift) / 100.0), 2
            ),
            "projected_pb_share_pct": float(db_scen.projected_pb_share),
            "projected_instock_rate_pct": float(db_scen.projected_instock_rate),
            "projected_shelf_capacity_pct": float(db_scen.projected_shelf_capacity),
            "sku_actions": {"grow": 5, "maintain": 12, "swap": 3, "reduce": 2},
        }
    else:
        cfg = SCENARIO_CONFIGS[clean_key]

    # Calculate SKU counts
    skus = db.query(Sku).filter(Sku.cluster_id == cluster.id).all()
    total_skus = len(skus) if skus else 22

    actions = cfg["sku_actions"]
    grow_cnt = actions["grow"]
    maintain_cnt = actions["maintain"]
    swap_cnt = actions["swap"]
    reduce_cnt = actions["reduce"]
    total_actionable = grow_cnt + maintain_cnt + swap_cnt + reduce_cnt

    guardrails, can_submit = evaluate_guardrails(
        projected_pb_share_pct=cfg["projected_pb_share_pct"],
        projected_shelf_capacity_pct=cfg["projected_shelf_capacity_pct"],
        projected_instock_rate_pct=cfg["projected_instock_rate_pct"],
    )

    return ScenarioImpactResponse(
        scenario_key=cfg["scenario_key"],
        scenario_name=cfg["scenario_name"],
        projected_sales_lift_pct=cfg["projected_sales_lift_pct"],
        projected_sales_per_linear_ft=cfg["projected_sales_per_linear_ft"],
        projected_pb_share_pct=cfg["projected_pb_share_pct"],
        projected_instock_rate_pct=cfg["projected_instock_rate_pct"],
        projected_shelf_capacity_pct=cfg["projected_shelf_capacity_pct"],
        sku_action_summary=SkuActionSummary(
            grow_count=grow_cnt,
            maintain_count=maintain_cnt,
            swap_count=swap_cnt,
            reduce_count=reduce_cnt,
            total_actionable=total_actionable,
        ),
        guardrails=guardrails,
        can_submit=can_submit,
    )
