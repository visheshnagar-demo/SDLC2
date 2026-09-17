from typing import Optional
from pydantic import BaseModel


class GuardrailCheckResult(BaseModel):
    rule_key: str
    rule_name: str
    threshold_value: float
    comparison_operator: str
    actual_value: float
    status: str  # "PASSED", "WARNING", "FAILED"


class GuardrailResponse(BaseModel):
    id: str
    rule_key: str
    rule_name: str
    threshold_value: float
    comparison_operator: str
    status: str
    scenario_id: Optional[str] = None

    class Config:
        from_attributes = True
