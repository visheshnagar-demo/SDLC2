from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DecisionCreate(BaseModel):
    decision: str  # 'QUOTE' or 'DECLINE'
    capacity_offered: Optional[float] = None
    rate_on_line_pct: Optional[float] = None
    premium_amount: Optional[float] = None
    binding_deadline: Optional[str] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    underwriter_id: Optional[str] = None
    underwriter_name: Optional[str] = None
    decision: str
    capacity_offered: Optional[float] = None
    rate_on_line_pct: Optional[float] = None
    premium_amount: Optional[float] = None
    binding_deadline: Optional[str] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    created_at: datetime
