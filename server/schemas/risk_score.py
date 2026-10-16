from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class RiskScoreBase(BaseModel):
    composite_score: int = Field(..., ge=0, le=100, description="Risk score from 0 to 100")
    risk_tier: str = Field(..., description="LOW, MEDIUM, HIGH, or CRITICAL")
    score_breakdown: Dict[str, Any]
    scoring_rules_version: str = "v1.0"


class RiskScoreRead(RiskScoreBase):
    id: str
    submission_id: str
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)
