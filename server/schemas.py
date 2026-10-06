from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# --- KPI Schemas ---
class ShelfCapacitySchema(BaseModel):
    current: float
    total: float
    unit: str = "LF"
    utilization_percentage: float = 94.6


class KPIMetricDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    metric_name: str
    value: float
    unit: str
    target_value: Optional[float] = None
    status_text: Optional[str] = None


class KPISummaryResponse(BaseModel):
    sales_per_linear_ft: float = 428.50
    private_brand_percentage: float = 24.5
    in_stock_rate: float = 96.8
    shelf_capacity: ShelfCapacitySchema
    metrics: List[KPIMetricDetail] = Field(default_factory=list)


# --- SKU Schemas ---
class SKUBase(BaseModel):
    sku_id: str
    name: str
    category: str = "Snacks"
    sales: float
    movement: int
    margin_percentage: float
    velocity: float
    recommended_action: str = "MAINTAIN"


class SKUCreate(SKUBase):
    pass


class SKUResponse(SKUBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    action: str = "MAINTAIN"


# --- Scenario Schemas ---
class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scenario_type: str
    description: Optional[str] = None
    projected_sales_increase_pct: float
    private_brand_change_pct: float
    shelf_utilization_pct: float
    is_preselected: bool = False


class SKUActionItem(BaseModel):
    sku_id: str
    action: str


class GuardrailStatus(BaseModel):
    private_brand_goal_met: bool = True
    shelf_capacity_compliant: bool = True
    in_stock_sla_met: bool = True


class SKUActionSummary(BaseModel):
    add: int = 0
    keep: int = 0
    swap: int = 0
    reduce: int = 0


class ScenarioCalculateRequest(BaseModel):
    scenario_type: str
    current_skus: Optional[List[SKUActionItem]] = None


class ScenarioCalculateResponse(BaseModel):
    scenario_type: str
    projected_sales_increase_percentage: float
    private_brand_change_percentage: float
    shelf_utilization_change_percentage: float
    guardrail_status: GuardrailStatus
    sku_action_summary: SKUActionSummary


# --- Assortment Plan Submission Schemas ---
class AssortmentPlanSubmitRequest(BaseModel):
    scenario_type: Optional[str] = "Balanced"
    scenario_selected: Optional[str] = None
    sku_actions: Optional[List[SKUActionItem]] = None
    user_id: Optional[str] = "Marcus Vance"
    cluster_id: Optional[str] = "STV-042"


class AssortmentPlanSubmitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    audit_id: str
    timestamp: str
    submission_timestamp: str
    user_id: str
    cluster_id: str
    scenario_selected: str
    sku_action_summary: Dict[str, int]
    detailed_sku_actions: List[Dict[str, Any]]
    guardrail_status: Dict[str, bool]
    status: str
    message: str
