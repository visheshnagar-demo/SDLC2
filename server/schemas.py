import re
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field, model_validator


def camel_to_snake(s: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", s).lower()


def snake_to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class BaseCamelModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        extra="ignore",
    )

    @model_validator(mode="before")
    @classmethod
    def _normalize_keys(cls, data: Any) -> Any:
        if isinstance(data, dict):
            normalized = {}
            for k, v in data.items():
                snake_k = camel_to_snake(k)
                normalized[snake_k] = v
            return normalized
        return data


# Risk Profile Schemas
class RiskProfileBase(BaseCamelModel):
    claims_count_3yr: Optional[int] = Field(default=0)
    total_losses_3yr: Optional[float] = Field(default=0.0)
    security_framework: Optional[str] = Field(default=None)
    mfa_enforced: Optional[bool] = Field(default=False)
    backup_immutable: Optional[bool] = Field(default=False)
    board_governance_score: Optional[float] = Field(default=0.0)
    regulatory_enforcement_action: Optional[bool] = Field(default=False)
    esg_risk_rating: Optional[str] = Field(default=None)
    details: Optional[str] = Field(default=None)


class RiskProfileCreate(RiskProfileBase):
    pass


class RiskProfileResponse(RiskProfileBase):
    id: str
    submission_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Submission Document Schemas
class SubmissionDocumentBase(BaseCamelModel):
    document_type: str
    file_name: str
    file_size: Optional[int] = Field(default=0)
    file_url: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default="VERIFIED")


class SubmissionDocumentCreate(SubmissionDocumentBase):
    pass


class SubmissionDocumentResponse(SubmissionDocumentBase):
    id: str
    submission_id: str
    created_at: Optional[datetime] = None


# Missing Information Flag Schemas
class MissingInformationFlagBase(BaseCamelModel):
    field_or_document_name: str
    description: str
    severity: Optional[str] = Field(default="MEDIUM")
    is_resolved: Optional[bool] = Field(default=False)


class MissingInformationFlagCreate(MissingInformationFlagBase):
    pass


class MissingInformationFlagResponse(MissingInformationFlagBase):
    id: str
    submission_id: str
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


# Risk Score Schemas
class RiskScoreBase(BaseCamelModel):
    composite_score: float
    completeness_score: float = Field(default=0.0)
    exposure_score: float = Field(default=0.0)
    loss_history_score: float = Field(default=0.0)
    governance_score: float = Field(default=0.0)
    risk_tier: str = Field(default="MEDIUM")
    benchmark_delta: Optional[float] = Field(default=0.0)
    notes: Optional[str] = None


class RiskScoreResponse(RiskScoreBase):
    id: str
    submission_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Underwriting Decision Schemas
class DecisionCreate(BaseCamelModel):
    decision_type: str
    quoted_capacity: Optional[float] = Field(default=None)
    premium_rate_pct: Optional[float] = Field(default=None)
    quoted_premium: Optional[float] = Field(default=None)
    quote_validity_days: Optional[int] = Field(default=None)
    decline_reason_code: Optional[str] = Field(default=None)
    underwriter_notes: Optional[str] = Field(default=None)
    decided_by: Optional[str] = Field(default="underwriter@reinsurance.com")

    @model_validator(mode="before")
    @classmethod
    def _normalize_decision_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            d = {}
            for k, v in data.items():
                d[camel_to_snake(k)] = v

            # Key variations
            if "premium_rate" in d and "premium_rate_pct" not in d:
                d["premium_rate_pct"] = d["premium_rate"]
            if "decline_reason" in d and "decline_reason_code" not in d:
                d["decline_reason_code"] = d["decline_reason"]
            if "notes" in d and "underwriter_notes" not in d:
                d["underwriter_notes"] = d["notes"]
            if "decision_type" in d and isinstance(d["decision_type"], str):
                d["decision_type"] = d["decision_type"].upper().strip()
            return d
        return data


class DecisionResponse(BaseCamelModel):
    id: str
    submission_id: str
    decision_type: str
    quoted_capacity: Optional[float] = Field(default=None)
    premium_rate_pct: Optional[float] = Field(default=None)
    quoted_premium: Optional[float] = Field(default=None)
    quote_validity_days: Optional[int] = Field(default=None)
    decline_reason_code: Optional[str] = Field(default=None)
    underwriter_notes: Optional[str] = Field(default=None)
    decided_by: Optional[str] = Field(default=None)
    created_at: Optional[datetime] = Field(default=None)


# Audit Log Schemas
class AuditLogResponse(BaseCamelModel):
    id: str
    submission_id: str
    actor_id: str
    actor_role: str
    action: str
    state_before: Optional[str] = Field(default=None)
    state_after: Optional[str] = Field(default=None)
    details: Optional[str] = None
    timestamp: datetime


# Decline Reason Schema
class DeclineReason(BaseCamelModel):
    code: str
    description: str
    category: Optional[str] = None


# Reinsurance Submission Schemas
class ReinsuranceSubmissionCreate(BaseCamelModel):
    risk_type: str
    insured_name: str
    industry_sector: str
    annual_revenue: float
    primary_policy_limit: float
    requested_reinsurance_limit: float
    attachment_point: float
    policy_effective_date: str
    policy_expiration_date: str

    # Optional nested structures
    risk_profile: Optional[RiskProfileCreate] = Field(default=None)
    documents: Optional[List[SubmissionDocumentCreate]] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def _normalize_submission_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            d = {}
            for k, v in data.items():
                d[camel_to_snake(k)] = v

            # Normalize alias for requested limit
            if "requested_limit" in d and "requested_reinsurance_limit" not in d:
                d["requested_reinsurance_limit"] = d["requested_limit"]

            # Normalize risk_type
            rt = d.get("risk_type")
            if rt and isinstance(rt, str):
                normalized_rt = (
                    rt.strip().upper().replace("&", "_AND_").replace(" ", "_")
                )
                if "CYBER" in normalized_rt:
                    d["risk_type"] = "CYBER"
                elif (
                    "D_AND_O" in normalized_rt
                    or "D_O" in normalized_rt
                    or "D&O" in normalized_rt
                ):
                    d["risk_type"] = "D_AND_O"
                else:
                    d["risk_type"] = normalized_rt
            return d
        return data


class ReinsuranceSubmissionResponse(BaseCamelModel):
    id: str
    tracking_number: str
    risk_type: str
    insured_name: str
    industry_sector: str
    annual_revenue: float
    primary_policy_limit: float
    requested_reinsurance_limit: float
    attachment_point: float
    policy_effective_date: str
    policy_expiration_date: str
    status: str
    overall_risk_score: float = Field(default=0.0)
    risk_tier: str = Field(default="MEDIUM")
    missing_flags_count: int = Field(default=0)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)

    # Nested entities
    risk_profile: Optional[RiskProfileResponse] = Field(default=None)
    documents: Optional[List[SubmissionDocumentResponse]] = Field(default_factory=list)
    risk_scores: Optional[List[RiskScoreResponse]] = Field(default_factory=list)
    missing_flags: Optional[List[MissingInformationFlagResponse]] = Field(
        default_factory=list
    )
    decisions: Optional[List[DecisionResponse]] = Field(default_factory=list)
    audit_logs: Optional[List[AuditLogResponse]] = Field(default_factory=list)


class QueueItemResponse(BaseCamelModel):
    id: str
    tracking_number: str
    insured_name: str
    risk_type: str
    requested_limit: float
    attachment_point: float
    status: str
    overall_risk_score: float
    risk_tier: str
    missing_flags_count: int
    created_at: Optional[datetime] = Field(default=None)
