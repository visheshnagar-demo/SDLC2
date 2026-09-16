from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class KpiMetrics(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sales_per_linear_ft: float
    sales_per_linear_ft_formatted: str
    private_brand_percentage: float
    in_stock_rate_percentage: float
    shelf_capacity_percentage: float


class ClusterKpiResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cluster_id: str
    cluster_name: str
    category: str
    sales_per_linear_ft: float
    sales_per_linear_ft_formatted: str
    private_brand_percentage: float
    in_stock_rate_percentage: float
    shelf_capacity_percentage: float
    metrics: Optional[KpiMetrics] = None
    updated_at: datetime


class SkuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sku_code: str
    name: str
    brand_type: str
    weekly_sales_units: int
    sales_volume_usd: float
    margin_percentage: float
    linear_space_inches: float
    recommended_action: str
    status_badge_color: str


class SkuListResponse(BaseModel):
    total_count: int
    skus: List[SkuItemResponse]


class ScenarioOptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    scenario_type: str
    scenario_name: str
    description: str
    is_default: bool
    sales_delta_percentage: float
    margin_delta_percentage: float
    private_brand_mix_delta: float
    shelf_capacity_projected_percentage: float


class ScenarioListResponse(BaseModel):
    total_count: int
    scenarios: List[ScenarioOptionResponse]


class ScenarioEvaluateRequest(BaseModel):
    cluster_id: Optional[str] = None
    scenario_type: str = Field(..., description="CONSERVATIVE, BALANCED, or AGGRESSIVE")


class ProjectedImpact(BaseModel):
    sales_delta_percentage: float
    margin_delta_percentage: float
    private_brand_mix_delta: float
    shelf_capacity_projected_percentage: float


class SkuActionSummary(BaseModel):
    grow_count: int
    maintain_count: int
    swap_count: int
    reduce_count: int
    total_actions: int


class GuardrailCheck(BaseModel):
    name: str
    status: str  # PASSED | WARNING | FAILED
    current_value: str
    threshold: str


class ScenarioEvaluateResponse(BaseModel):
    scenario_type: str
    scenario_name: str
    projected_impact: ProjectedImpact
    sku_action_summary: SkuActionSummary
    guardrail_checks: List[GuardrailCheck]
    can_submit: bool


class PlanSubmitRequest(BaseModel):
    cluster_id: Optional[str] = None
    scenario_type: str = Field(..., description="CONSERVATIVE, BALANCED, or AGGRESSIVE")
    submitted_by: str = Field(default="category_manager_dg@example.com")
    notes: Optional[str] = None


class PlanSubmitResponse(BaseModel):
    audit_id: str
    submission_id: str
    status: str
    cluster_id: str
    scenario_type: str
    sku_actions_committed: int
    guardrail_summary: str
    submitted_by: str
    submitted_at: datetime
    confirmation_message: str


class AuditDetailResponse(BaseModel):
    audit_id: str
    plan_id: str
    status: str
    cluster_id: str
    scenario_type: str
    submitted_by: str
    submitted_at: datetime
    notes: Optional[str] = None
    projected_sales_delta_pct: float
    projected_margin_delta_pct: float
    projected_pb_mix_delta: float
    guardrail_status: str
    actions: List[Dict[str, Any]]
    guardrail_checks: List[GuardrailCheck]
    created_at: datetime
