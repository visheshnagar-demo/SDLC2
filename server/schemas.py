from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator


# --- Auth & User Schemas ---


class UserBase(BaseModel):
    email: str
    full_name: str
    organization_name: Optional[str] = None
    role: str = "CARRIER_REP"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Risk Profile Schemas ---


class RiskProfileBase(BaseModel):
    prior_losses_count: Optional[int] = 0
    total_loss_amount: Optional[float] = 0.0
    security_framework: Optional[str] = None
    mfa_enforced: Optional[bool] = None
    has_offline_backups: Optional[bool] = None
    has_pending_claims: Optional[bool] = None
    profile_data: Optional[Dict[str, Any]] = None


class RiskProfileCreate(RiskProfileBase):
    pass


class RiskProfileResponse(RiskProfileBase):
    id: str
    submission_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Document Schemas ---


class DocumentCreate(BaseModel):
    document_type: str
    file_name: str
    file_size_bytes: Optional[int] = 0
    file_url: Optional[str] = None
    is_verified: Optional[bool] = False


class DocumentResponse(BaseModel):
    id: str
    submission_id: str
    document_type: str
    file_name: str
    file_size_bytes: int
    file_url: Optional[str] = None
    is_verified: bool
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Risk Score & Flag Schemas ---


class RiskScoreResponse(BaseModel):
    id: str
    submission_id: str
    overall_score: float
    completeness_score: float
    exposure_score: float
    loss_score: float
    governance_score: float
    risk_tier: str
    scoring_breakdown: Optional[Dict[str, Any]] = None
    scored_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MissingFlagResponse(BaseModel):
    id: str
    submission_id: str
    field_name: str
    flag_severity: str
    description: str
    is_resolved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Decision Schemas ---


class DecisionCreate(BaseModel):
    decision_type: Literal["QUOTE", "DECLINE"]
    quoted_capacity: Optional[float] = None
    premium_rate_pct: Optional[float] = None
    quoted_premium: Optional[float] = None
    quote_validity_days: Optional[int] = None
    decline_reason_code: Optional[str] = None
    underwriter_notes: Optional[str] = None

    @field_validator("decision_type")
    @classmethod
    def validate_decision_type(cls, v: str) -> str:
        if v not in ("QUOTE", "DECLINE"):
            raise ValueError("decision_type must be either 'QUOTE' or 'DECLINE'")
        return v


class DecisionResponse(BaseModel):
    id: str
    submission_id: str
    underwriter_id: Optional[str] = None
    decision_type: str
    quoted_capacity: Optional[float] = None
    premium_rate_pct: Optional[float] = None
    quoted_premium: Optional[float] = None
    quote_validity_days: Optional[int] = None
    decline_reason_code: Optional[str] = None
    underwriter_notes: Optional[str] = None
    decided_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Audit Log Schemas ---


class AuditLogResponse(BaseModel):
    id: str
    submission_id: str
    actor_id: Optional[str] = None
    actor_role: str
    action: str
    state_before: Optional[Dict[str, Any]] = None
    state_after: Optional[Dict[str, Any]] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Submission Schemas ---


class ReinsuranceSubmissionCreate(BaseModel):
    risk_type: Literal["CYBER", "D_AND_O"]
    insured_name: str = Field(..., min_length=1)
    industry_sector: str = Field(..., min_length=1)
    annual_revenue: float = Field(..., gt=0)
    primary_policy_limit: float = Field(..., gt=0)
    requested_reinsurance_limit: float = Field(..., gt=0)
    attachment_point: float = Field(..., ge=0)
    policy_effective_date: date
    policy_expiration_date: date
    risk_profile: Optional[RiskProfileCreate] = None
    documents: Optional[List[DocumentCreate]] = Field(default_factory=list)

    @field_validator("risk_type")
    @classmethod
    def validate_risk_type(cls, v: str) -> str:
        if v not in ("CYBER", "D_AND_O"):
            raise ValueError("risk_type must be 'CYBER' or 'D_AND_O'")
        return v

    @field_validator("policy_expiration_date")
    @classmethod
    def validate_dates(cls, v: date, info) -> date:
        if (
            "policy_effective_date" in info.data
            and v < info.data["policy_effective_date"]
        ):
            raise ValueError(
                "policy_expiration_date must be after policy_effective_date"
            )
        return v


class ReinsuranceSubmissionResponse(BaseModel):
    id: str
    tracking_number: str
    carrier_id: Optional[str] = None
    risk_type: str
    insured_name: str
    industry_sector: str
    annual_revenue: float
    primary_policy_limit: float
    requested_reinsurance_limit: float
    attachment_point: float
    policy_effective_date: date
    policy_expiration_date: date
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReinsuranceSubmissionDetailResponse(ReinsuranceSubmissionResponse):
    risk_profile: Optional[RiskProfileResponse] = None
    documents: List[DocumentResponse] = Field(default_factory=list)
    risk_score: Optional[RiskScoreResponse] = None
    missing_flags: List[MissingFlagResponse] = Field(default_factory=list)
    decision: Optional[DecisionResponse] = None
    audit_logs: List[AuditLogResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class SubmissionListResponse(BaseModel):
    items: List[ReinsuranceSubmissionResponse]
    total: int
    skip: int
    limit: int


# --- Underwriting Review Queue Schemas ---


class UnderwritingQueueItem(BaseModel):
    id: str
    tracking_number: str
    insured_name: str
    risk_type: str
    industry_sector: str
    requested_limit: float
    attachment_point: float
    status: str
    overall_risk_score: Optional[float] = None
    risk_tier: Optional[str] = None
    missing_flags_count: int = 0
    missing_flags: List[Dict[str, Any]] = Field(default_factory=list)
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UnderwritingQueueResponse(BaseModel):
    items: List[UnderwritingQueueItem]
    total: int
    skip: int
    limit: int
