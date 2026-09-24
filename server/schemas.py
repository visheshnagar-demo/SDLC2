from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class KPIMetrics(BaseModel):
    sales_per_linear_foot: float
    private_brand_percentage: float
    in_stock_rate: float
    shelf_capacity_used: float
    shelf_capacity_total: float
    shelf_utilization_percentage: float


class KPISummaryResponse(BaseModel):
    cluster_id: str
    category: str
    metrics: KPIMetrics
    updated_at: datetime


class SKUBase(BaseModel):
    sku_number: str
    name: str
    brand: str
    is_private_brand: bool
    sales_amount: float
    sales_per_linear_foot: float
    margin_percentage: float
    velocity_units_per_week: int
    shelf_space_linear_ft: float
    status_badge: str


class SKUResponse(SKUBase):
    id: str
    cluster_id: Optional[str] = None

    class Config:
        from_attributes = True


class SKUListResponse(BaseModel):
    total: int
    items: List[SKUResponse]


class ScenarioActionsSummary(BaseModel):
    grow: int = 0
    maintain: int = 0
    swap: int = 0
    reduce: int = 0


class ScenarioResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    projected_sales_lift_pct: float
    projected_private_brand_change_pct: float
    projected_shelf_utilization_pct: float
    actions_summary: Dict[str, int]
    is_default: bool

    class Config:
        from_attributes = True


class ScenarioListResponse(BaseModel):
    scenarios: List[ScenarioResponse]


class AssortmentSubmitRequest(BaseModel):
    cluster_id: str = "STV-CLUSTER-04"
    category: str = "Snacks"
    scenario_id: str = "balanced"
    submitted_by: str = "category.manager@dollargeneral.com"
    notes: Optional[str] = None


class SkuActionSummary(BaseModel):
    grow_count: int
    maintain_count: int
    swap_count: int
    reduce_count: int
    total_skus: int


class GuardrailResult(BaseModel):
    rule: str
    passed: bool
    actual_value: str


class AssortmentSubmitResponse(BaseModel):
    submission_id: str
    status: str
    scenario_selected: str
    cluster_id: str
    category: str
    submitted_by: str
    submitted_at: datetime
    sku_action_summary: SkuActionSummary
    guardrail_results: List[GuardrailResult]
    audit_trail_message: str


class AuditLogResponse(BaseModel):
    id: str
    plan_id: Optional[str] = None
    event_type: str
    user_id: str
    payload: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
