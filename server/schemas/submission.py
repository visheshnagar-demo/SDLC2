from datetime import date, datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, model_validator


class CyberProfileSchema(BaseModel):
    industry_sector: str
    record_count: int = Field(ge=0, default=0)
    has_mfa_email: bool = False
    has_mfa_remote_access: bool = False
    has_mfa_admin_accounts: bool = False
    has_edr_deployed: bool = False
    has_immutable_backups: bool = False
    prior_ransomware_claims: int = Field(ge=0, default=0)

    class Config:
        from_attributes = True


class DoProfileSchema(BaseModel):
    company_structure: str  # PUBLIC, PRIVATE, NON_PROFIT
    market_cap: Optional[float] = None
    debt_to_equity_ratio: float
    executive_turnover_count: int = Field(ge=0, default=0)
    has_board_oversight_charter: bool = False
    pending_litigation_flag: bool = False
    prior_securities_claims: int = Field(ge=0, default=0)

    class Config:
        from_attributes = True


class SubmissionCreate(BaseModel):
    carrier_name: str
    insured_name: str
    risk_type: Literal["CYBER", "DO"]
    primary_limit: float = Field(gt=0, description="Primary limit must be greater than 0")
    attachment_point: float = Field(ge=0, description="Attachment point must be non-negative")
    ceded_limit: float = Field(gt=0, description="Ceded limit must be greater than 0")
    carrier_premium: float = Field(gt=0, description="Carrier premium must be greater than 0")
    policy_start_date: date
    policy_end_date: date
    cyber_profile: Optional[CyberProfileSchema] = None
    do_profile: Optional[DoProfileSchema] = None

    @model_validator(mode="after")
    def validate_policy_dates_and_profiles(self):
        if self.policy_end_date <= self.policy_start_date:
            raise ValueError("policy_end_date must be strictly after policy_start_date")
        if self.risk_type == "CYBER" and not self.cyber_profile:
            # We allow it, but note it might lead to uncalibrated risk scoring
            pass
        if self.risk_type == "DO" and not self.do_profile:
            pass
        return self


class RiskScoreResponse(BaseModel):
    id: Optional[str] = None
    calculated_score: float
    risk_tier: str
    scoring_breakdown: Dict[str, Any] = Field(default_factory=dict)
    is_calibrated: bool = True
    created_at: Optional[datetime] = None

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


class SubmissionCreatedResponse(BaseModel):
    id: str
    submission_number: str
    status: str
    risk_score: RiskScoreResponse
    missing_flags_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class SubmissionSummaryResponse(BaseModel):
    id: str
    submission_number: str
    carrier_name: str
    insured_name: str
    risk_type: str
    primary_limit: float
    attachment_point: float
    ceded_limit: float
    carrier_premium: float
    policy_start_date: date
    policy_end_date: date
    status: str
    calculated_score: Optional[float] = None
    risk_tier: Optional[str] = None
    missing_flags_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubmissionDetailResponse(BaseModel):
    id: str
    submission_number: str
    carrier_name: str
    insured_name: str
    risk_type: str
    primary_limit: float
    attachment_point: float
    ceded_limit: float
    carrier_premium: float
    policy_start_date: date
    policy_end_date: date
    status: str
    created_at: datetime
    updated_at: datetime
    cyber_profile: Optional[CyberProfileSchema] = None
    do_profile: Optional[DoProfileSchema] = None
    risk_score: Optional[RiskScoreResponse] = None
    flags: List[MissingInfoFlagResponse] = Field(default_factory=list)
    decision: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class PaginatedSubmissionsResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[SubmissionSummaryResponse]
