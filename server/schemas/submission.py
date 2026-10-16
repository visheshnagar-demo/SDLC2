from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class AttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    attachment_id: Optional[str] = None
    submission_id: str
    document_category: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    uploaded_at: datetime


class MissingFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    flag_code: str
    field_name: str
    severity: str  # BLOCKING, WARNING
    message: str
    is_resolved: bool
    created_at: datetime


class RiskScoreBreakdownResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    rule_key: str
    rule_name: str
    score_delta: int
    rationale: str
    evaluated_at: datetime


class SubmissionBase(BaseModel):
    risk_type: str = Field(..., description="CYBER or D_AND_O")
    insured_name: str
    industry_segment: str
    annual_revenue: float
    sum_insured: float
    attachment_point: float
    policy_start_date: date
    policy_end_date: date
    prior_claims_count: int = 0
    prior_claims_total: float = 0.0
    security_governance_score: Optional[float] = None


class SubmissionCreate(SubmissionBase):
    is_final_submission: Optional[bool] = False


class SubmissionUpdate(BaseModel):
    risk_type: Optional[str] = None
    insured_name: Optional[str] = None
    industry_segment: Optional[str] = None
    annual_revenue: Optional[float] = None
    sum_insured: Optional[float] = None
    attachment_point: Optional[float] = None
    policy_start_date: Optional[date] = None
    policy_end_date: Optional[date] = None
    prior_claims_count: Optional[int] = None
    prior_claims_total: Optional[float] = None
    security_governance_score: Optional[float] = None
    is_final_submission: Optional[bool] = False


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_id: str
    carrier_name: Optional[str] = None
    risk_type: str
    insured_name: str
    industry_segment: str
    annual_revenue: float
    sum_insured: float
    attachment_point: float
    policy_start_date: date
    policy_end_date: date
    prior_claims_count: int
    prior_claims_total: float
    security_governance_score: Optional[float] = None
    status: str
    risk_score: Optional[int] = None
    risk_tier: Optional[str] = None
    missing_flags_count: Optional[int] = 0
    active_lock_user_id: Optional[str] = None
    locked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class SubmissionListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[SubmissionResponse]
