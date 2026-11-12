from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, model_validator


class DecisionCreate(BaseModel):
    decision_type: str = Field(..., description="Decision type: QUOTE or DECLINE")
    offered_capacity: Optional[float] = Field(
        None, description="Capacity offered in USD"
    )
    quoted_rate: Optional[float] = Field(
        None, description="Quoted rate percentage e.g. 3.5"
    )
    quoted_premium: Optional[float] = Field(
        None, description="Total quoted premium in USD"
    )
    terms_conditions: Optional[str] = Field(
        None, description="Underwriting terms and conditions"
    )
    exclusions: Optional[List[str]] = Field(
        default=[], description="List of specific exclusion clauses"
    )
    decline_reason_code: Optional[str] = Field(
        None, description="Standardized decline reason code"
    )
    decline_notes: Optional[str] = Field(
        None, description="Underwriter notes explaining decline"
    )

    @model_validator(mode="after")
    def validate_decision_payload(self):
        d_type = (self.decision_type or "").upper().strip()
        if d_type not in ("QUOTE", "DECLINE"):
            raise ValueError("decision_type must be either 'QUOTE' or 'DECLINE'")
        self.decision_type = d_type

        if d_type == "DECLINE":
            if not self.decline_reason_code or not self.decline_reason_code.strip():
                raise ValueError(
                    "decline_reason_code is required for DECLINE decisions"
                )
        elif d_type == "QUOTE":
            if self.offered_capacity is not None and self.offered_capacity <= 0:
                raise ValueError("offered_capacity must be greater than 0")
        return self


class DecisionResponse(BaseModel):
    id: str
    submission_id: str
    decision_type: str
    offered_capacity: Optional[float] = None
    quoted_rate: Optional[float] = None
    quoted_premium: Optional[float] = None
    terms_conditions: Optional[str] = None
    exclusions: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DeclineReason(BaseModel):
    code: str
    label: str
    category: str
    description: str


class DeclineReasonListResponse(BaseModel):
    reasons: List[DeclineReason]
    total: int
