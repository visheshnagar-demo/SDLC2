from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class ApprovalRequest(BaseModel):
    scenario_key: str
    cluster_id: Optional[str] = "small_town_value"
    manager_user_id: Optional[str] = "MGR-DG-8812"
    manager_email: Optional[str] = "category.manager@dollargeneral.com"
    notes: Optional[str] = None


class ApprovalResponse(BaseModel):
    approval_id: str
    audit_reference_id: str
    cluster_id: str
    approved_scenario: str
    status: str
    approved_at: str
    manager_user_id: str
    manager_email: str
    sku_action_metrics: Dict[str, Any]
    projected_impact: Dict[str, Any]
    message: str

    model_config = ConfigDict(from_attributes=True)
