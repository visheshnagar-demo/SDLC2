from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AttachmentCreate(BaseModel):
    file_name: str
    file_type: str
    file_size: Optional[int] = 0
    file_url: Optional[str] = ""
    document_category: Optional[str] = "SUPPORTING_DOC"


class AttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    file_name: str
    file_type: str
    file_size: int
    file_url: str
    document_category: str
    uploaded_at: datetime


class MissingFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    field_name: str
    flag_type: str
    message: str
    is_resolved: bool
    created_at: datetime


class RiskScoreRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    rule_key: str
    rule_name: str
    score_delta: float
    rationale: str
    created_at: datetime


class SubmissionCreate(BaseModel):
    # Required fields without defaults so FastAPI raises 422 if missing
    insured_name: str
    industry_segment: str
    risk_type: str  # 'CYBER' or 'D_AND_O'
    annual_revenue: float
    sum_insured: float
    attachment_point: float

    # Optional fields
    policy_start_date: Optional[str] = None
    policy_end_date: Optional[str] = None
    prior_claims_count: int = 0
    prior_claims_total: float = 0.0
    security_governance_score: float = 0.0
    carrier_name: Optional[str] = None
    status: Optional[str] = "SUBMITTED"


class SubmissionUpdate(BaseModel):
    insured_name: Optional[str] = None
    industry_segment: Optional[str] = None
    risk_type: Optional[str] = None
    annual_revenue: Optional[float] = None
    sum_insured: Optional[float] = None
    attachment_point: Optional[float] = None
    policy_start_date: Optional[str] = None
    policy_end_date: Optional[str] = None
    prior_claims_count: Optional[int] = None
    prior_claims_total: Optional[float] = None
    security_governance_score: Optional[float] = None
    status: Optional[str] = None


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_id: Optional[str] = None
    carrier_name: Optional[str] = None
    insured_name: str
    industry_segment: str
    risk_type: str
    annual_revenue: float
    sum_insured: float
    attachment_point: float
    policy_start_date: Optional[str] = None
    policy_end_date: Optional[str] = None
    prior_claims_count: int
    prior_claims_total: float
    security_governance_score: float
    risk_score: float
    risk_tier: str
    status: str
    active_lock_user_id: Optional[str] = None
    active_lock_user_name: Optional[str] = None
    active_lock_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentResponse] = []
    risk_score_breakdowns: List[RiskScoreRuleResponse] = []
    missing_flags: List[MissingFlagResponse] = []


class SubmissionCreatedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_id: Optional[str] = None
    carrier_name: Optional[str] = None
    insured_name: str
    industry_segment: str
    risk_type: str
    annual_revenue: float
    sum_insured: float
    attachment_point: float
    policy_start_date: Optional[str] = None
    policy_end_date: Optional[str] = None
    prior_claims_count: int
    prior_claims_total: float
    security_governance_score: float
    risk_score: float
    risk_tier: str
    status: str
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentResponse] = []
    risk_score_breakdowns: List[RiskScoreRuleResponse] = []
    missing_flags: List[MissingFlagResponse] = []
