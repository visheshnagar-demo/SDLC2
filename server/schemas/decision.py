from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, model_validator


class DecisionCreate(BaseModel):
    decision_type: Literal["QUOTE", "DECLINE"]
    offered_capacity: Optional[float] = Field(default=None, description="Offered capacity for quote")
    quoted_rate: Optional[float] = Field(default=None, description="Quoted rate-on-line %")
    quoted_premium: Optional[float] = Field(default=None, description="Quoted premium amount")
    terms_conditions: Optional[str] = None
    exclusions: Optional[List[str]] = Field(default_factory=list)
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_decision_fields(self):
        if self.decision_type == "DECLINE":
            if not self.decline_reason_code or not self.decline_reason_code.strip():
                raise ValueError("decline_reason_code is required when decision_type is DECLINE")
        elif self.decision_type == "QUOTE":
            if self.offered_capacity is not None and self.offered_capacity <= 0:
                raise ValueError("offered_capacity must be greater than 0")
        return self


class DecisionResponse(BaseModel):
    id: str
    submission_id: str
    decision_type: str
    status: str
    offered_capacity: Optional[float] = None
    quoted_rate: Optional[float] = None
    quoted_premium: Optional[float] = None
    terms_conditions: Optional[str] = None
    exclusions: Optional[List[str]] = Field(default_factory=list)
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    recorded_at: datetime

    class Config:
        from_attributes = True


class DeclineReason(BaseModel):
    code: str
    label: str
