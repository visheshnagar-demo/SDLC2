from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ClusterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    code: str
    category: str
    total_linear_feet: float
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ClusterListResponse(BaseModel):
    total: int
    items: List[ClusterResponse]


class KPIValues(BaseModel):
    sales_per_linear_foot: float
    private_brand_percentage: float
    in_stock_rate_percentage: float
    shelf_capacity_utilization_percentage: float


class ClusterKPIResponse(BaseModel):
    cluster_id: str
    cluster_name: str
    category: str
    kpis: KPIValues
    last_updated: str


class SKUResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    cluster_id: Optional[str] = None
    sku_code: str
    product_name: str
    brand_name: str
    is_private_brand: bool
    sub_category: str
    weekly_sales_volume: Optional[float] = 0.0
    sales_per_linear_ft: float
    linear_feet_allocated: float
    in_stock_rate: float
    status_badge: str


class SKUListResponse(BaseModel):
    total: int
    items: List[SKUResponse]


class GuardrailStatus(BaseModel):
    min_private_brand_met: bool
    capacity_threshold_met: bool
    overall_status: str


class SKUActionsSummary(BaseModel):
    add_count: int
    keep_count: int
    swap_count: int
    remove_count: int


class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scenario_type: str
    name: str
    description: Optional[str] = None
    is_default: bool
    projected_sales_delta_pct: float
    projected_pb_shift_pct: float
    projected_space_util_pct: float
    guardrails: GuardrailStatus
    sku_actions: SKUActionsSummary


class ScenarioListResponse(BaseModel):
    cluster_id: str
    scenarios: List[ScenarioResponse]


class AssortmentSubmissionCreate(BaseModel):
    scenario_id: str
    scenario_type: str
    submitted_by_user: str
    notes: Optional[str] = None


class SkuActionSummaryDict(BaseModel):
    adds: int
    keeps: int
    swaps: int
    removes: int


class AssortmentSubmissionResponse(BaseModel):
    submission_id: str
    audit_reference: str
    cluster_id: str
    scenario_type: str
    submitted_by: str
    submitted_at: str
    guardrail_status: str
    sku_action_summary: SkuActionSummaryDict
    status: str = "CONFIRMED"
    checksum: Optional[str] = None
    notes: Optional[str] = None


class SubmissionListResponse(BaseModel):
    total: int
    items: List[AssortmentSubmissionResponse]
