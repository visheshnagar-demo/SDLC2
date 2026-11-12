from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class CyberProfileBase(BaseModel):
    mfa_enabled: Optional[bool] = None
    edr_implemented: Optional[bool] = None
    offline_backups: Optional[bool] = None
    encryption_at_rest: Optional[bool] = None
    record_count: Optional[int] = None
    prior_ransomware_claims: Optional[bool] = None
    prior_claims_amount: Optional[float] = 0.0
    security_training: Optional[bool] = None


class CyberProfileCreate(CyberProfileBase):
    pass


class CyberProfileResponse(CyberProfileBase):
    id: str
    submission_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DoProfileBase(BaseModel):
    leverage_ratio: Optional[float] = None
    executive_turnover_rate: Optional[float] = None
    active_litigation: Optional[bool] = None
    litigation_details: Optional[str] = None
    independent_board_charter: Optional[bool] = None
    regulatory_investigations: Optional[bool] = None
    annual_revenue: Optional[float] = None


class DoProfileCreate(DoProfileBase):
    pass


class DoProfileResponse(DoProfileBase):
    id: str
    submission_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MissingInfoFlagResponse(BaseModel):
    id: str
    submission_id: str
    field_name: str
    flag_code: str
    description: str
    severity: str
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RiskScoreResponse(BaseModel):
    id: str
    submission_id: str
    overall_score: float
    risk_tier: str
    breakdown_json: Optional[str] = None
    calculated_at: datetime

    class Config:
        from_attributes = True


class DecisionSummaryResponse(BaseModel):
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


class SubmissionCreate(BaseModel):
    carrier_name: str = Field(
        ..., min_length=1, description="Name of submitting carrier"
    )
    insured_name: str = Field(..., min_length=1, description="Name of insured entity")
    risk_type: str = Field(..., description="Risk category: CYBER or DO")
    primary_limit: float = Field(
        ..., gt=0, description="Primary limit in USD (must be > 0)"
    )
    attachment_point: float = Field(
        ..., ge=0, description="Attachment point in USD (must be >= 0)"
    )
    ceded_limit: float = Field(
        ..., gt=0, description="Ceded limit in USD (must be > 0)"
    )
    carrier_premium: float = Field(
        ..., gt=0, description="Gross premium in USD (must be > 0)"
    )
    policy_start_date: str = Field(
        ..., description="Policy effective start date (YYYY-MM-DD)"
    )
    policy_end_date: str = Field(..., description="Policy expiration date (YYYY-MM-DD)")
    cyber_profile: Optional[CyberProfileCreate] = None
    do_profile: Optional[DoProfileCreate] = None

    @field_validator("risk_type")
    @classmethod
    def validate_risk_type(cls, v: str) -> str:
        upper_v = v.upper().strip()
        if upper_v not in ("CYBER", "DO"):
            raise ValueError("risk_type must be either 'CYBER' or 'DO'")
        return upper_v

    @field_validator("policy_start_date", "policy_end_date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        try:
            datetime.strptime(v.strip(), "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in valid YYYY-MM-DD format")
        return v.strip()


class SubmissionResponse(BaseModel):
    id: str
    carrier_name: str
    insured_name: str
    risk_type: str
    primary_limit: float
    attachment_point: float
    ceded_limit: float
    carrier_premium: float
    policy_start_date: str
    policy_end_date: str
    status: str
    risk_score: float
    risk_tier: str
    created_at: datetime
    updated_at: datetime
    cyber_profile: Optional[CyberProfileResponse] = None
    do_profile: Optional[DoProfileResponse] = None
    risk_score_detail: Optional[RiskScoreResponse] = None
    flags: List[MissingInfoFlagResponse] = []
    decisions: List[DecisionSummaryResponse] = []

    class Config:
        from_attributes = True


class SubmissionListResponse(BaseModel):
    items: List[SubmissionResponse]
    total: int
    skip: int
    limit: int
