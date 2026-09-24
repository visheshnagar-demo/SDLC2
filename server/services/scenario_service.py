from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models import Cluster, Scenario
from server.schemas import (
    ScenarioListResponse,
    ScenarioResponse,
    GuardrailStatus,
    SKUActionsSummary,
)


def scenario_to_response(sc: Scenario) -> ScenarioResponse:
    guardrails = GuardrailStatus(
        min_private_brand_met=sc.min_private_brand_met,
        capacity_threshold_met=sc.capacity_threshold_met,
        overall_status=sc.overall_guardrail_status,
    )
    sku_actions = SKUActionsSummary(
        add_count=sc.add_count,
        keep_count=sc.keep_count,
        swap_count=sc.swap_count,
        remove_count=sc.remove_count,
    )
    return ScenarioResponse(
        id=sc.id,
        scenario_type=sc.scenario_type,
        name=sc.name,
        description=sc.description,
        is_default=sc.is_default,
        projected_sales_delta_pct=sc.projected_sales_delta_pct,
        projected_pb_shift_pct=sc.projected_pb_shift_pct,
        projected_space_util_pct=sc.projected_space_util_pct,
        guardrails=guardrails,
        sku_actions=sku_actions,
    )


def get_cluster_scenarios(db: Session, cluster_id: str) -> ScenarioListResponse:
    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID '{cluster_id}' not found",
        )

    scenarios = (
        db.query(Scenario)
        .filter(Scenario.cluster_id == cluster_id)
        .order_by(Scenario.is_default.desc(), Scenario.name.asc())
        .all()
    )

    return ScenarioListResponse(
        cluster_id=cluster.id,
        scenarios=[scenario_to_response(s) for s in scenarios],
    )


def get_scenario_by_id(db: Session, cluster_id: str, scenario_id: str) -> Scenario:
    scenario = (
        db.query(Scenario)
        .filter(Scenario.id == scenario_id, Scenario.cluster_id == cluster_id)
        .first()
    )
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario with ID '{scenario_id}' not found for cluster '{cluster_id}'",
        )
    return scenario
