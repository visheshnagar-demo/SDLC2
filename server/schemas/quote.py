from typing import Optional, List, Any
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class QuoteCreate(BaseModel):
    share_offered_pct: float = Field(..., ge=0.1, le=100.0)
    ceding_commission_pct: float = Field(..., ge=0.0, le=100.0)
    proposed_gross_premium: Optional[float] = None
    conditions: Optional[str] = None
    exclusions: Optional[List[str]] = None
    valid_until: Optional[date] = None


class QuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    quote_number: str
    submission_id: str
    created_by_user_id: str
    share_offered_pct: float
    reinsurance_exposed_limit: float
    ceding_commission_pct: float
    proposed_gross_premium: float
    gross_reinsurance_premium: float
    reinsurance_premium: float
    conditions: Optional[str] = None
    exclusions: Optional[Any] = None
    status: str
    valid_until: date
    created_at: datetime
    updated_at: datetime
