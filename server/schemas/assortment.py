from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class SKUResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sku_code: str
    product_name: str
    category: str
    weekly_sales: float
    margin_pct: float
    shelf_space_ft: float
    status_badge: str
    is_private_brand: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ActionCounts(BaseModel):
    GROW: int = 0
    MAINTAIN: int = 0
    SWAP: int = 0
    REDUCE: int = 0


class ScenarioDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scenario_key: str
    display_name: str
    description: str
    projected_sales_per_linear_ft: float
    projected_private_brand_pct: float
    projected_in_stock_rate_pct: float
    projected_shelf_capacity_pct: float
    action_counts: ActionCounts


class ScenariosResponse(BaseModel):
    active_default: str = "balanced"
    scenarios: List[ScenarioDetail]


class MetricsResponse(BaseModel):
    sales_per_linear_ft: float
    private_brand_pct: float
    in_stock_rate_pct: float
    shelf_capacity_pct: float
    is_projected: bool = False


class SubmitRequest(BaseModel):
    scenario_key: str = Field(
        ..., description="Scenario key: conservative, balanced, aggressive"
    )
    user_id: str = Field(default="mgr_snack_001", description="ID of category manager")
    justification_note: Optional[str] = Field(
        default=None, description="Optional approval justification notes"
    )


class SubmissionSummary(BaseModel):
    projected_sales_per_linear_ft: float
    projected_private_brand_pct: float
    total_skus_reviewed: int


class SubmitResponse(BaseModel):
    status: str = "SUCCESS"
    audit_confirmation_id: str
    submitted_at: datetime
    scenario_name: str
    user_id: str
    guardrail_status: str = "PASSED"
    summary: SubmissionSummary


class SubmissionRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    audit_confirmation_id: str
    scenario_key: str
    scenario_name: str
    user_id: str
    justification_note: Optional[str] = None
    guardrail_status: str
    audit_trail_json: Dict[str, Any]
    created_at: datetime
