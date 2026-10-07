from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ScenarioImpactRequest(BaseModel):
    cluster_id: Optional[str] = "small_town_value"
    scenario_key: str = "balanced"


class SkuActionSummary(BaseModel):
    grow_count: int
    maintain_count: int
    swap_count: int
    reduce_count: int
    total_actionable: int


class GuardrailItem(BaseModel):
    rule_id: str
    name: str
    target_value: str
    projected_value: str
    status: str
    is_critical: bool


class ScenarioImpactResponse(BaseModel):
    scenario_key: str
    scenario_name: str
    projected_sales_lift_pct: float
    projected_sales_per_linear_ft: float
    projected_pb_share_pct: float
    projected_instock_rate_pct: float
    projected_shelf_capacity_pct: float
    sku_action_summary: SkuActionSummary
    guardrails: List[GuardrailItem]
    can_submit: bool

    model_config = ConfigDict(from_attributes=True)
