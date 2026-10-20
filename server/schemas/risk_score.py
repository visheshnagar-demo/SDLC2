from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class RiskScoreFactor(BaseModel):
    factor_key: str
    factor_name: str
    max_points: int
    awarded_points: int
    passed: bool
    description: Optional[str] = None


class RiskScoreBreakdown(BaseModel):
    factors: List[RiskScoreFactor]
    summary_notes: Optional[str] = None


class RiskScoreRequest(BaseModel):
    factors_input: Optional[Dict[str, Any]] = None  # Explicit factor values if provided
    notes: Optional[str] = None


class RiskScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    total_score: int
    risk_tier: str
    score_breakdown: Dict[str, Any]
    evaluator_user_id: Optional[str] = None
    evaluated_at: datetime
