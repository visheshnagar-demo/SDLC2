import random
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models.cluster import ClusterModel
from server.models.sku import SnacksSkuModel
from server.models.plan import AssortmentPlanModel, PlanSkuActionModel
from server.services.scenario_service import ScenarioService
from server.schemas.plan import (
    AssortmentPlanSubmitRequest,
    AssortmentPlanResponse,
    PlanAuditSummary,
    SkuActionDetail,
)


class ApprovalService:
    @staticmethod
    def submit_plan(
        db: Session, req: AssortmentPlanSubmitRequest
    ) -> AssortmentPlanResponse:
        scenario = ScenarioService.get_scenario_by_code(db, req.scenario_code)
        if not scenario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scenario '{req.scenario_code}' not found",
            )

        cluster_code = req.cluster_code or "STV-CLUSTER"
        cluster = db.query(ClusterModel).filter_by(cluster_code=cluster_code).first()
        if not cluster:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cluster '{cluster_code}' not found",
            )

        evaluation = ScenarioService.evaluate_scenario(
            db, req.scenario_code, cluster_code=cluster.cluster_code
        )

        # Generate unique Audit ID
        audit_num = random.randint(10000, 99999)
        audit_id = f"AUD-2026-{audit_num}"

        guardrail_status = (
            "ALL_PASSED" if evaluation.is_submittable else "GUARDRAILS_WARNING"
        )

        plan = AssortmentPlanModel(
            audit_id=audit_id,
            cluster_id=cluster.id,
            scenario_id=scenario.id,
            submitted_by=req.submitted_by or "Category Manager",
            status="APPROVED",
            total_sku_actions=evaluation.action_summary.total_actions,
            guardrail_status=guardrail_status,
            summary_snapshot={
                "scenario_code": scenario.code,
                "scenario_name": scenario.name,
                "projected_impact": evaluation.projected_impact.model_dump(),
                "action_summary": evaluation.action_summary.model_dump(),
                "guardrail_checks": [
                    g.model_dump() for g in evaluation.guardrail_checks
                ],
                "notes": req.notes,
            },
        )
        db.add(plan)
        db.flush()

        # Link SKU actions
        skus = db.query(SnacksSkuModel).filter_by(cluster_id=cluster.id).all()
        for sku in skus:
            action = PlanSkuActionModel(
                plan_id=plan.id,
                sku_id=sku.id,
                action_type=sku.status_badge,
            )
            db.add(action)

        db.commit()
        db.refresh(plan)

        return ApprovalService.format_plan_response(db, plan)

    @staticmethod
    def get_plan_by_audit_id(
        db: Session, audit_id: str
    ) -> Optional[AssortmentPlanResponse]:
        plan = (
            db.query(AssortmentPlanModel)
            .filter(
                (AssortmentPlanModel.audit_id == audit_id)
                | (AssortmentPlanModel.id == audit_id)
            )
            .first()
        )

        if not plan:
            return None

        return ApprovalService.format_plan_response(db, plan)

    @staticmethod
    def format_plan_response(
        db: Session, plan: AssortmentPlanModel
    ) -> AssortmentPlanResponse:
        actions = (
            db.query(PlanSkuActionModel, SnacksSkuModel)
            .join(SnacksSkuModel, PlanSkuActionModel.sku_id == SnacksSkuModel.id)
            .filter(PlanSkuActionModel.plan_id == plan.id)
            .all()
        )

        action_details = [
            SkuActionDetail(
                sku_id=sku.id,
                sku_code=sku.sku_code,
                name=sku.name,
                action_type=act.action_type,
            )
            for act, sku in actions
        ]

        action_breakdown = {}
        for act in action_details:
            action_breakdown[act.action_type] = (
                action_breakdown.get(act.action_type, 0) + 1
            )

        scenario_name = plan.scenario.name if plan.scenario else "Balanced"
        scenario_code = plan.scenario.code if plan.scenario else "balanced"
        cluster_code = plan.cluster.cluster_code if plan.cluster else "STV-CLUSTER"

        audit_summary = PlanAuditSummary(
            audit_id=plan.audit_id,
            plan_id=plan.id,
            scenario_code=scenario_code,
            scenario_name=scenario_name,
            cluster_code=cluster_code,
            submitted_by=plan.submitted_by,
            timestamp=plan.created_at,
            guardrail_status=plan.guardrail_status,
            total_sku_actions=plan.total_sku_actions,
            summary_snapshot=plan.summary_snapshot,
            action_breakdown=action_breakdown,
            actions=action_details,
        )

        resp = AssortmentPlanResponse(
            id=plan.id,
            audit_id=plan.audit_id,
            cluster_id=plan.cluster_id,
            scenario_id=plan.scenario_id,
            submitted_by=plan.submitted_by,
            status=plan.status,
            total_sku_actions=plan.total_sku_actions,
            guardrail_status=plan.guardrail_status,
            summary_snapshot=plan.summary_snapshot,
            timestamp=plan.created_at,
            created_at=plan.created_at,
            updated_at=plan.updated_at,
            audit_trail_summary=audit_summary,
        )

        return resp
