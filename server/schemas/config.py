from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ScoringRuleConfigBase(BaseModel):
    line_of_business: str
    display_name: str
    description: Optional[str] = None
    max_score: int = 100
    rules_json: Dict[str, Any]
    authority_limit_threshold: float = 5000000.0
    warning_sla_hours: float = 24.0
    breach_sla_hours: float = 48.0


class ScoringRuleConfigUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    max_score: Optional[int] = None
    rules_json: Optional[Dict[str, Any]] = None
    authority_limit_threshold: Optional[float] = None
    warning_sla_hours: Optional[float] = None
    breach_sla_hours: Optional[float] = None


class ScoringRuleConfigResponse(ScoringRuleConfigBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
