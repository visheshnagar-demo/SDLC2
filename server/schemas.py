from datetime import datetime, date
from typing import Optional, List, Dict, Any, Literal, Union
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator


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

    model_config = ConfigDict(extra="allow", from_attributes=True)


class RiskProfileCreate(RiskProfileBase):
    @model_validator(mode="before")
    @classmethod
    def normalize_profile_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            normalized = dict(data)
            # Map mfa_implemented -> mfa_enforced
            if (
                "mfa_implemented" in normalized
                and normalized.get("mfa_enforced") is None
            ):
                normalized["mfa_enforced"] = normalized["mfa_implemented"]

            # Map prior_cyber_incidents_3yr -> prior_losses_count
            if "prior_cyber_incidents_3yr" in normalized and not normalized.get(
                "prior_losses_count"
            ):
                normalized["prior_losses_count"] = normalized[
                    "prior_cyber_incidents_3yr"
                ]

            # Map regulatory_investigation_pending -> has_pending_claims
            if (
                "regulatory_investigation_pending" in normalized
                and normalized.get("has_pending_claims") is None
            ):
                normalized["has_pending_claims"] = normalized[
                    "regulatory_investigation_pending"
                ]

            # Map cloud_backup_frequency -> has_offline_backups
            if (
                "cloud_backup_frequency" in normalized
                and normalized.get("has_offline_backups") is None
            ):
                cbf = str(normalized["cloud_backup_frequency"]).upper()
                if cbf in ("DAILY", "REALTIME", "CONTINUOUS", "TRUE", "1"):
                    normalized["has_offline_backups"] = True
                elif cbf in ("NONE", "FALSE", "0"):
                    normalized["has_offline_backups"] = False

            # Capture extra keys in profile_data
            existing_profile_data = normalized.get("profile_data") or {}
            combined = {**normalized, **existing_profile_data}
            normalized["profile_data"] = combined
            return normalized
        return data


class RiskProfileResponse(RiskProfileBase):
    id: str
    submission_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="allow")


# --- Document Schemas ---


class DocumentCreate(BaseModel):
    document_type: str
    file_name: str
    file_size_bytes: Optional[int] = 0
    file_url: Optional[str] = None
    is_verified: Optional[bool] = False
    status: Optional[str] = None
    uploaded: Optional[bool] = None

    model_config = ConfigDict(extra="allow", from_attributes=True)


class DocumentResponse(BaseModel):
    id: str
    submission_id: str
    document_type: str
    file_name: str
    file_size_bytes: int
    file_url: Optional[str] = None
    is_verified: bool
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="allow")


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

    model_config = ConfigDict(from_attributes=True, extra="allow")


class MissingFlagResponse(BaseModel):
    id: str
    submission_id: str
    field_name: str
    flag_severity: str
    description: str
    is_resolved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="allow")


# --- Decision Schemas ---


class DeclineReason(BaseModel):
    code: str
    label: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, extra="allow")


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

    model_config = ConfigDict(from_attributes=True, extra="allow")


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

    model_config = ConfigDict(from_attributes=True, extra="allow")


# --- Submission Schemas ---


class ReinsuranceSubmissionCreate(BaseModel):
    risk_type: str = Field(..., min_length=1)
    insured_name: str = Field(..., min_length=1)
    industry_sector: str = Field(..., min_length=1)
    annual_revenue: float = Field(..., gt=0)
    primary_policy_limit: float = Field(..., gt=0)
    requested_reinsurance_limit: float = Field(..., gt=0)
    attachment_point: float = Field(..., ge=0)
    policy_effective_date: Optional[date] = None
    policy_expiration_date: Optional[date] = None
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    requested_limit: Optional[float] = None
    primary_limit: Optional[float] = None
    retention: Optional[float] = None
    risk_profile: Optional[Union[RiskProfileCreate, Dict[str, Any]]] = None
    documents: Optional[List[DocumentCreate]] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow", from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def normalize_submission_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            normalized = dict(data)

            # 1. Normalize risk_type
            if "risk_type" in normalized and isinstance(normalized["risk_type"], str):
                rt = (
                    normalized["risk_type"]
                    .upper()
                    .replace("&", "_AND_")
                    .replace("-", "_")
                    .replace(" ", "_")
                )
                if "CYBER" in rt:
                    normalized["risk_type"] = "CYBER"
                elif "D_AND_O" in rt or "D_O" in rt or "DIRECTOR" in rt:
                    normalized["risk_type"] = "D_AND_O"
                else:
                    normalized["risk_type"] = rt

            # 2. Normalize requested_reinsurance_limit / requested_limit
            if (
                "requested_limit" in normalized
                and "requested_reinsurance_limit" not in normalized
            ):
                normalized["requested_reinsurance_limit"] = normalized[
                    "requested_limit"
                ]
            elif (
                "requested_reinsurance_limit" in normalized
                and "requested_limit" not in normalized
            ):
                normalized["requested_limit"] = normalized[
                    "requested_reinsurance_limit"
                ]

            # 3. Normalize primary_policy_limit / primary_limit
            if (
                "primary_limit" in normalized
                and "primary_policy_limit" not in normalized
            ):
                normalized["primary_policy_limit"] = normalized["primary_limit"]
            elif (
                "primary_policy_limit" in normalized
                and "primary_limit" not in normalized
            ):
                normalized["primary_limit"] = normalized["primary_policy_limit"]

            # 4. Normalize attachment_point / retention
            if "retention" in normalized and "attachment_point" not in normalized:
                normalized["attachment_point"] = normalized["retention"]
            elif "attachment_point" in normalized and "retention" not in normalized:
                normalized["retention"] = normalized["attachment_point"]

            # 5. Normalize effective date
            eff = normalized.get("policy_effective_date") or normalized.get(
                "effective_date"
            )
            if eff:
                normalized["policy_effective_date"] = eff
                normalized["effective_date"] = eff
            else:
                today_iso = date.today().isoformat()
                normalized["policy_effective_date"] = today_iso
                normalized["effective_date"] = today_iso

            # 6. Normalize expiration date
            exp = normalized.get("policy_expiration_date") or normalized.get(
                "expiration_date"
            )
            if exp:
                normalized["policy_expiration_date"] = exp
                normalized["expiration_date"] = exp
            else:
                eff_raw = normalized.get("policy_effective_date")
                if isinstance(eff_raw, str):
                    try:
                        eff_d = date.fromisoformat(eff_raw)
                    except Exception:
                        eff_d = date.today()
                elif isinstance(eff_raw, date):
                    eff_d = eff_raw
                else:
                    eff_d = date.today()
                try:
                    exp_d = date(eff_d.year + 1, eff_d.month, eff_d.day).isoformat()
                except ValueError:
                    exp_d = date(eff_d.year + 1, eff_d.month, 28).isoformat()
                normalized["policy_expiration_date"] = exp_d
                normalized["expiration_date"] = exp_d

            return normalized
        return data

    @field_validator("risk_type")
    @classmethod
    def validate_risk_type(cls, v: str) -> str:
        v_upper = v.upper().replace("&", "_AND_").replace("-", "_").replace(" ", "_")
        if "CYBER" in v_upper:
            return "CYBER"
        if "D_AND_O" in v_upper or "D_O" in v_upper:
            return "D_AND_O"
        if v_upper not in ("CYBER", "D_AND_O"):
            raise ValueError("risk_type must be 'CYBER' or 'D_AND_O'")
        return v_upper

    @field_validator("policy_expiration_date", "expiration_date")
    @classmethod
    def validate_dates(cls, v: Optional[date], info) -> Optional[date]:
        eff = info.data.get("policy_effective_date") or info.data.get("effective_date")
        if v is not None and eff is not None:
            if v < eff:
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
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    requested_limit: Optional[float] = None
    primary_limit: Optional[float] = None
    retention: Optional[float] = None
    overall_risk_score: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="allow")


class ReinsuranceSubmissionDetailResponse(ReinsuranceSubmissionResponse):
    risk_profile: Optional[RiskProfileResponse] = None
    documents: List[DocumentResponse] = Field(default_factory=list)
    risk_score: Optional[Union[RiskScoreResponse, float, Dict[str, Any]]] = None
    missing_flags: List[MissingFlagResponse] = Field(default_factory=list)
    decision: Optional[DecisionResponse] = None
    audit_logs: List[AuditLogResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True, extra="allow")


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

    model_config = ConfigDict(from_attributes=True, extra="allow")


class UnderwritingQueueResponse(BaseModel):
    items: List[UnderwritingQueueItem]
    total: int
    skip: int
    limit: int
