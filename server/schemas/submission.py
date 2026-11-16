from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class AttachmentCreate(BaseModel):
    file_name: str
    file_type: str
    file_size: int = 0
    file_path: Optional[str] = None
    document_category: str = (
        "OTHER"  # FINANCIALS, LOSS_RUNS, SECURITY_AUDIT, POLICY_WORDING, OTHER
    )


class AttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    file_name: str
    file_type: str
    file_size: int
    file_path: Optional[str] = None
    document_category: str
    uploaded_by: Optional[str] = None
    created_at: datetime


class MissingFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    field_name: str
    flag_type: str  # BLOCKING, WARNING
    message: str
    is_resolved: bool
    created_at: datetime


class RiskScoreBreakdownResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    rule_key: str
    rule_name: str
    score_delta: float
    rationale: str
    created_at: datetime


class SubmissionCreate(BaseModel):
    risk_type: str = Field(..., description="Risk type: CYBER or D_AND_O")
    insured_name: str = Field(..., min_length=1)
    industry_segment: str = Field(..., min_length=1)
    annual_revenue: float = Field(..., ge=0)
    sum_insured: float = Field(..., gt=0)
    attachment_point: float = Field(..., ge=0)
    policy_start_date: str = Field(...)
    policy_end_date: str = Field(...)
    prior_claims_count: int = Field(default=0, ge=0)
    prior_claims_total: float = Field(default=0.0, ge=0)
    security_governance_score: Optional[float] = Field(default=None, ge=0, le=100)
    notes: Optional[str] = None


class SubmissionUpdate(BaseModel):
    risk_type: Optional[str] = None
    insured_name: Optional[str] = None
    industry_segment: Optional[str] = None
    annual_revenue: Optional[float] = None
    sum_insured: Optional[float] = None
    attachment_point: Optional[float] = None
    policy_start_date: Optional[str] = None
    policy_end_date: Optional[str] = None
    prior_claims_count: Optional[int] = None
    prior_claims_total: Optional[float] = None
    security_governance_score: Optional[float] = None
    notes: Optional[str] = None


class SubmissionCreatedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    risk_type: str
    risk_score: float
    risk_tier: str
    status: str
    insured_name: str
    sum_insured: float
    attachment_point: float
    created_at: datetime


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_id: str
    risk_type: str
    insured_name: str
    industry_segment: str
    annual_revenue: float
    sum_insured: float
    attachment_point: float
    policy_start_date: str
    policy_end_date: str
    prior_claims_count: int
    prior_claims_total: float
    security_governance_score: Optional[float] = None
    status: str
    risk_score: float
    risk_tier: str
    active_lock_user_id: Optional[str] = None
    lock_expires_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentResponse] = []
    missing_flags: List[MissingFlagResponse] = []
    score_breakdowns: List[RiskScoreBreakdownResponse] = []
