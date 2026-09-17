from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel


class SkuActionDetail(BaseModel):
    sku_id: str
    sku_code: str
    name: str
    action_type: str


class AssortmentPlanSubmitRequest(BaseModel):
    scenario_code: str
    cluster_code: Optional[str] = "STV-CLUSTER"
    submitted_by: Optional[str] = "Category Manager"
    notes: Optional[str] = None


class PlanAuditSummary(BaseModel):
    audit_id: str
    plan_id: str
    scenario_code: str
    scenario_name: str
    cluster_code: str
    submitted_by: str
    timestamp: datetime
    guardrail_status: str
    total_sku_actions: int
    summary_snapshot: Optional[Dict[str, Any]] = None
    action_breakdown: Optional[Dict[str, int]] = None
    actions: Optional[List[SkuActionDetail]] = None


class AssortmentPlanResponse(BaseModel):
    id: str
    audit_id: str
    cluster_id: str
    scenario_id: str
    submitted_by: str
    status: str
    total_sku_actions: int
    guardrail_status: str
    summary_snapshot: Optional[Dict[str, Any]] = None
    timestamp: datetime
    created_at: datetime
    updated_at: datetime
    audit_trail_summary: Optional[PlanAuditSummary] = None

    class Config:
        from_attributes = True
