from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models.scenario import ScenarioConfigModel
from server.models.sku import SnacksSkuModel
from server.models.cluster import ClusterModel
from server.services.kpi_service import KpiService
from server.services.guardrail_service import GuardrailService
from server.schemas.scenario import (
    ScenarioResponse,
    ScenarioListResponse,
    ScenarioEvaluateResponse,
    ProjectedImpact,
    ActionSummary,
)


class ScenarioService:
    @staticmethod
    def get_all_scenarios(db: Session) -> ScenarioListResponse:
        scenarios = (
            db.query(ScenarioConfigModel)
            .order_by(ScenarioConfigModel.created_at.asc())
            .all()
        )
        items = [ScenarioResponse.model_validate(s) for s in scenarios]
        return ScenarioListResponse(scenarios=items)

    @staticmethod
    def get_scenario_by_code(db: Session, code: str) -> Optional[ScenarioConfigModel]:
        return (
            db.query(ScenarioConfigModel)
            .filter(
                (ScenarioConfigModel.code == code.lower())
                | (ScenarioConfigModel.id == code)
            )
            .first()
        )

    @staticmethod
    def evaluate_scenario(
        db: Session, scenario_code: str, cluster_code: str = "STV-CLUSTER"
    ) -> ScenarioEvaluateResponse:
        scenario = ScenarioService.get_scenario_by_code(db, scenario_code)
        if not scenario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scenario '{scenario_code}' not found",
            )

        cluster = db.query(ClusterModel).filter_by(cluster_code=cluster_code).first()
        if not cluster:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cluster '{cluster_code}' not found",
            )

        kpi = KpiService.get_cluster_kpis(db, cluster_code=cluster_code)

        # Baseline margin calculation
        skus = db.query(SnacksSkuModel).filter_by(cluster_id=cluster.id).all()
        avg_margin = (sum(s.margin_pct for s in skus) / len(skus)) if skus else 29.5

        # Projections
        sales_delta = scenario.projected_sales_delta_pct
        pb_delta = scenario.projected_pb_share_pct
        in_stock_delta = scenario.projected_in_stock_pct
        capacity_delta = scenario.projected_capacity_pct

        proj_sales_per_ft = round(
            kpi.sales_per_linear_foot * (1.0 + sales_delta / 100.0), 2
        )
        proj_pb_share = round(kpi.private_brand_percentage + pb_delta, 1)
        proj_in_stock = round(
            min(100.0, max(0.0, kpi.in_stock_rate + in_stock_delta)), 1
        )
        proj_capacity = round(
            min(100.0, max(0.0, kpi.shelf_capacity + capacity_delta)), 1
        )
        proj_margin = round(avg_margin + (pb_delta * 0.7), 1)

        projected_impact = ProjectedImpact(
            sales_delta_pct=sales_delta,
            pb_share_pct=proj_pb_share,
            in_stock_pct=proj_in_stock,
            capacity_pct=proj_capacity,
            projected_sales_per_linear_foot=proj_sales_per_ft,
            baseline_sales_per_linear_foot=kpi.sales_per_linear_foot,
            projected_margin_pct=proj_margin,
        )

        # Calculate Action Counts
        grow_cnt = sum(1 for s in skus if s.status_badge == "GROW")
        maintain_cnt = sum(1 for s in skus if s.status_badge == "MAINTAIN")
        swap_cnt = sum(1 for s in skus if s.status_badge == "SWAP")
        reduce_cnt = sum(1 for s in skus if s.status_badge == "REDUCE")

        # Adjust based on scenario strategy
        if scenario.code == "conservative":
            grow_cnt = max(1, grow_cnt - 2)
            maintain_cnt = maintain_cnt + 2
            swap_cnt = max(1, swap_cnt - 1)
            reduce_cnt = max(1, reduce_cnt - 1)
        elif scenario.code == "aggressive":
            grow_cnt = grow_cnt + 2
            maintain_cnt = max(1, maintain_cnt - 2)
            swap_cnt = swap_cnt + 1
            reduce_cnt = reduce_cnt + 1

        total_actions = grow_cnt + maintain_cnt + swap_cnt + reduce_cnt

        action_summary = ActionSummary(
            grow_count=grow_cnt,
            maintain_count=maintain_cnt,
            swap_count=swap_cnt,
            reduce_count=reduce_cnt,
            total_actions=total_actions,
        )

        # Evaluate guardrails
        metrics_for_eval = {
            "margin_pct": proj_margin,
            "pb_share_pct": proj_pb_share,
            "capacity_pct": proj_capacity,
            "in_stock_pct": proj_in_stock,
        }
        guardrail_checks = GuardrailService.evaluate_guardrails(db, metrics_for_eval)
        is_submittable = all(g.status == "PASSED" for g in guardrail_checks)

        return ScenarioEvaluateResponse(
            scenario_code=scenario.code,
            scenario_name=scenario.name,
            projected_impact=projected_impact,
            action_summary=action_summary,
            guardrail_checks=guardrail_checks,
            is_submittable=is_submittable,
        )
