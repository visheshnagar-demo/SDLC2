from typing import List, Optional
from pydantic import BaseModel
from server.schemas.guardrail import GuardrailCheckResult


class ScenarioResponse(BaseModel):
    id: str
    code: str
    name: str
    description: str
    is_default: bool
    projected_sales_delta_pct: float
    projected_pb_share_pct: float
    projected_in_stock_pct: float
    projected_capacity_pct: float

    class Config:
        from_attributes = True


class ScenarioListResponse(BaseModel):
    scenarios: List[ScenarioResponse]


class ScenarioEvaluateRequest(BaseModel):
    scenario_code: str
    cluster_code: Optional[str] = "STV-CLUSTER"


class ProjectedImpact(BaseModel):
    sales_delta_pct: float
    pb_share_pct: float
    in_stock_pct: float
    capacity_pct: float
    projected_sales_per_linear_foot: float
    baseline_sales_per_linear_foot: float
    projected_margin_pct: float


class ActionSummary(BaseModel):
    grow_count: int
    maintain_count: int
    swap_count: int
    reduce_count: int
    total_actions: int


class ScenarioEvaluateResponse(BaseModel):
    scenario_code: str
    scenario_name: str
    projected_impact: ProjectedImpact
    action_summary: ActionSummary
    guardrail_checks: List[GuardrailCheckResult]
    is_submittable: bool
