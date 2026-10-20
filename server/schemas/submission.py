from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, Field, model_validator, ConfigDict
from server.schemas.document import DocumentResponse
from server.schemas.risk_score import RiskScoreResponse
from server.schemas.quote import QuoteResponse


class SubmissionBase(BaseModel):
    ceding_org_id: str
    insured_name: str
    line_of_business: str  # CYBER, DO, EO, EPLI, MEDMAL
    policy_limit: float = Field(..., gt=0)
    attachment_point: float = Field(..., ge=0)
    retention: float = Field(..., ge=0)
    proposed_premium: float = Field(..., gt=0)
    effective_date: date
    expiry_date: date
    industry: Optional[str] = None
    revenue_band: Optional[str] = None
    jurisdiction: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None

    @model_validator(mode="after")
    def validate_submission_logic(self):
        if self.effective_date >= self.expiry_date:
            raise ValueError("Expiry date must be after effective date")
        if self.policy_limit <= self.attachment_point:
            raise ValueError(
                "Policy limit must be strictly greater than attachment point"
            )
        return self


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    insured_name: Optional[str] = None
    policy_limit: Optional[float] = None
    attachment_point: Optional[float] = None
    retention: Optional[float] = None
    proposed_premium: Optional[float] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    industry: Optional[str] = None
    revenue_band: Optional[str] = None
    jurisdiction: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    actor_user_id: Optional[str] = None
    actor_email: Optional[str] = None
    actor_role: Optional[str] = None
    action_type: str
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    change_reason: Optional[str] = None
    created_at: datetime


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_number: str
    ceding_org_id: str
    created_by_user_id: str
    assigned_underwriter_id: Optional[str] = None
    insured_name: str
    line_of_business: str
    policy_limit: float
    attachment_point: float
    retention: float
    proposed_premium: float
    effective_date: date
    expiry_date: date
    industry: Optional[str] = None
    revenue_band: Optional[str] = None
    jurisdiction: Optional[str] = None
    status: str
    completeness_status: str
    risk_score_value: Optional[int] = None
    risk_tier: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    referral_status: Optional[str] = None
    referral_notes: Optional[str] = None
    referral_manager_id: Optional[str] = None
    referral_decided_at: Optional[datetime] = None
    additional_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    # SLA and computed fields
    hours_in_queue: Optional[float] = None
    sla_status: Optional[str] = None  # ON_TRACK, AT_RISK, BREACHED
    sla_hours_remaining: Optional[float] = None
    requires_manager_referral: Optional[bool] = None

    documents: Optional[List[DocumentResponse]] = None
    latest_score: Optional[RiskScoreResponse] = None
    latest_quote: Optional[QuoteResponse] = None


class SubmissionListResponse(BaseModel):
    items: List[SubmissionResponse]
    total: int
    page: int
    limit: int
    pages: int
