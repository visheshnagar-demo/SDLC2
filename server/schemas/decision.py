from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DecisionCreate(BaseModel):
    decision: str = Field(..., description="QUOTE or DECLINE")
    capacity_offered: Optional[float] = None
    rate_on_line_pct: Optional[float] = None
    binding_deadline: Optional[date] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    decision_id: Optional[str] = None
    submission_id: str
    underwriter_id: str
    decision: str
    status: Optional[str] = None
    capacity_offered: Optional[float] = None
    rate_on_line_pct: Optional[float] = None
    premium_amount: Optional[float] = None
    binding_deadline: Optional[date] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    decided_at: datetime
