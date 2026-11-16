import re
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
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

    # Frontend / alias fields
    mfa_implemented: Optional[bool] = None
    endpoint_detection_deployed: Optional[bool] = None
    data_backup_airgapped: Optional[bool] = None
    claims_history_5yr_count: Optional[int] = None
    records_count: Optional[int] = None
    board_oversight_policy: Optional[bool] = None
    dno_prior_litigation: Optional[bool] = None
    financial_restatements_3yr: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def _normalize_profile_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            d = {camel_to_snake(k): v for k, v in data.items()}
            if "mfa_implemented" in d and "mfa_enforced" not in d:
                d["mfa_enforced"] = bool(d["mfa_implemented"])
            if "data_backup_airgapped" in d and "backup_immutable" not in d:
                d["backup_immutable"] = bool(d["data_backup_airgapped"])
            if "claims_history_5yr_count" in d and "claims_count_3yr" not in d:
                try:
                    d["claims_count_3yr"] = int(d["claims_history_5yr_count"] or 0)
                except (ValueError, TypeError):
                    d["claims_count_3yr"] = 0
            if "board_oversight_policy" in d and "board_governance_score" not in d:
                d["board_governance_score"] = 80.0 if d["board_oversight_policy"] else 20.0
            if "dno_prior_litigation" in d and "regulatory_enforcement_action" not in d:
                d["regulatory_enforcement_action"] = bool(d["dno_prior_litigation"])
            return d
        return data


class RiskProfileCreate(RiskProfileBase):
    pass


class RiskProfileResponse(RiskProfileBase):
    id: str
    submission_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# Submission Document Schemas
class SubmissionDocumentBase(BaseCamelModel):
    document_type: Optional[str] = Field(default="GENERAL")
    file_name: Optional[str] = Field(default="document.pdf")
    filename: Optional[str] = None
    file_size: Optional[int] = Field(default=0)
    file_url: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default="VERIFIED")

    @model_validator(mode="before")
    @classmethod
    def _normalize_doc(cls, data: Any) -> Any:
        if isinstance(data, dict):
            d = {camel_to_snake(k): v for k, v in data.items()}
            if "filename" in d and "file_name" not in d:
                d["file_name"] = d["filename"]
            if "file_name" in d and "filename" not in d:
                d["filename"] = d["file_name"]
            if "document_type" not in d or not d["document_type"]:
                d["document_type"] = "GENERAL"
            if "file_name" not in d or not d["file_name"]:
                d["file_name"] = "document.pdf"
            return d
        return data


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
            for k in ["premium_rate", "rate", "rate_pct", "premium_rate_percentage"]:
                if k in d and "premium_rate_pct" not in d:
                    d["premium_rate_pct"] = d[k]
            for k in ["decline_reason", "reason_code", "reason", "decline_code"]:
                if k in d and "decline_reason_code" not in d:
                    d["decline_reason_code"] = d[k]
            for k in ["notes", "comments", "rationale", "reason_notes"]:
                if k in d and "underwriter_notes" not in d:
                    d["underwriter_notes"] = d[k]
            for k in ["capacity", "quoted_limit", "capacity_amount"]:
                if k in d and "quoted_capacity" not in d:
                    d["quoted_capacity"] = d[k]
            for k in ["premium", "quoted_amount", "annual_premium"]:
                if k in d and "quoted_premium" not in d:
                    d["quoted_premium"] = d[k]

            if "decision" in d and "decision_type" not in d:
                d["decision_type"] = d["decision"]
            if "decision_type" in d and isinstance(d["decision_type"], str):
                dt = d["decision_type"].upper().strip()
                if "QUOTE" in dt:
                    d["decision_type"] = "QUOTE"
                elif "DECLINE" in dt:
                    d["decision_type"] = "DECLINE"
                else:
                    d["decision_type"] = dt
            return d
        return data


class DecisionResponse(BaseCamelModel):
    id: str
    submission_id: str
    decision_type: str
    decision: Optional[str] = None
    quoted_capacity: Optional[float] = Field(default=None)
    premium_rate_pct: Optional[float] = Field(default=None)
    quoted_premium: Optional[float] = Field(default=None)
    quote_validity_days: Optional[int] = Field(default=None)
    decline_reason_code: Optional[str] = Field(default=None)
    decline_reason: Optional[str] = Field(default=None)
    underwriter_notes: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    decided_by: Optional[str] = Field(default=None)
    created_at: Optional[datetime] = Field(default=None)

    @model_validator(mode="before")
    @classmethod
    def _compute_decision_helpers(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "decision" not in data:
                data["decision"] = data.get("decision_type")
            if "decline_reason" not in data:
                data["decline_reason"] = data.get("decline_reason_code")
            if "notes" not in data:
                data["notes"] = data.get("underwriter_notes")
            return data
        elif hasattr(data, "__dict__"):
            d = {c.name: getattr(data, c.name) for c in data.__table__.columns}
            d["decision"] = getattr(data, "decision_type", None)
            d["decline_reason"] = getattr(data, "decline_reason_code", None)
            d["notes"] = getattr(data, "underwriter_notes", None)
            return d
        return data


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
    insured_name: str
    risk_type: Optional[str] = Field(default="CYBER")
    industry_sector: Optional[str] = Field(default="Financial Services")
    annual_revenue: Optional[float] = Field(default=10000000.0)
    primary_policy_limit: Optional[float] = Field(default=10000000.0)
    requested_reinsurance_limit: Optional[float] = Field(default=5000000.0)
    attachment_point: Optional[float] = Field(default=0.0)
    policy_effective_date: Optional[str] = Field(default=None)
    policy_expiration_date: Optional[str] = Field(default=None)

    # Optional attributes
    loss_history: Optional[List[Any]] = None
    security_audit: Optional[Dict[str, Any]] = None
    financial_statements: Optional[Dict[str, Any]] = None
    litigation_history: Optional[List[Any]] = None
    attachments: Optional[List[Any]] = None
    revenue: Optional[float] = None
    market_cap: Optional[float] = None
    industry: Optional[str] = None
    notes: Optional[str] = None
    policy_limit: Optional[float] = None
    limit: Optional[float] = None
    sum_insured: Optional[float] = None
    requested_limit: Optional[float] = None
    risk_profile: Optional[RiskProfileCreate] = Field(default=None)
    documents: Optional[List[SubmissionDocumentCreate]] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def _normalize_submission_aliases(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data

        d = {}
        for k, v in data.items():
            d[camel_to_snake(k)] = v

        # Insured name aliases (Mandatory)
        insured = None
        for key in [
            "insured_name",
            "insured_entity_name",
            "insured_entity",
            "insured",
            "entity_name",
            "company_name",
            "name",
        ]:
            if key in d and d[key] is not None:
                val = str(d[key]).strip()
                if val:
                    insured = val
                    break

        if not insured:
            raise ValueError("insured_name is required and cannot be empty")
        d["insured_name"] = insured

        # Risk type aliases & flexible casing normalization
        rt = None
        for key in ["risk_type", "line_of_business", "risk_line", "type"]:
            if key in d and d[key] is not None:
                rt = str(d[key]).strip()
                break

        if rt:
            rt_upper = (
                rt.upper().replace("&", "_AND_").replace(" ", "_").replace("-", "_")
            )
            if "CYBER" in rt_upper or "CYB" in rt_upper:
                d["risk_type"] = "CYBER"
            elif (
                "D_AND_O" in rt_upper
                or "D_O" in rt_upper
                or "D&O" in rt_upper
                or "DO" in rt_upper
                or "DNO" in rt_upper
                or "DIRECTOR" in rt_upper
            ):
                d["risk_type"] = "D_AND_O"
            else:
                d["risk_type"] = rt_upper
        else:
            d["risk_type"] = "CYBER"

        # Industry / Sector
        for key in ["industry_sector", "industry", "sector", "business_sector"]:
            if key in d and d[key] is not None:
                d["industry_sector"] = str(d[key]).strip()
                break
        if "industry_sector" not in d or not d["industry_sector"]:
            d["industry_sector"] = "Financial Services"

        # Revenue
        for key in ["annual_revenue", "revenue", "turnover"]:
            if key in d and d[key] is not None:
                try:
                    d["annual_revenue"] = float(d[key])
                    break
                except (ValueError, TypeError):
                    pass
        if "annual_revenue" not in d or d["annual_revenue"] is None:
            d["annual_revenue"] = 10000000.0

        # Primary policy limit
        for key in [
            "primary_policy_limit",
            "policy_limit",
            "limit",
            "sum_insured",
            "primary_limit",
            "policyLimit",
            "primaryPolicyLimit",
            "sumInsured",
        ]:
            if key in d and d[key] is not None:
                try:
                    d["primary_policy_limit"] = float(d[key])
                    break
                except (ValueError, TypeError):
                    pass
        if "primary_policy_limit" not in d or d["primary_policy_limit"] is None:
            d["primary_policy_limit"] = 10000000.0

        # Requested reinsurance limit
        for key in [
            "requested_reinsurance_limit",
            "requested_limit",
            "reinsurance_limit",
            "fac_limit",
            "facultative_limit",
            "requestedReinsuranceLimit",
            "requestedLimit",
        ]:
            if key in d and d[key] is not None:
                try:
                    d["requested_reinsurance_limit"] = float(d[key])
                    break
                except (ValueError, TypeError):
                    pass
        if (
            "requested_reinsurance_limit" not in d
            or d["requested_reinsurance_limit"] is None
        ):
            d["requested_reinsurance_limit"] = (
                float(d["primary_policy_limit"]) * 0.5
                if "primary_policy_limit" in d
                else 5000000.0
            )

        # Attachment point
        for key in [
            "attachment_point",
            "attachmentPoint",
            "attachment",
            "deductible",
            "retention",
        ]:
            if key in d and d[key] is not None:
                try:
                    d["attachment_point"] = float(d[key])
                    break
                except (ValueError, TypeError):
                    pass
        if "attachment_point" not in d or d["attachment_point"] is None:
            d["attachment_point"] = 0.0

        # Dates
        today_str = date.today().isoformat()
        next_year_str = (date.today() + timedelta(days=365)).isoformat()

        for key in ["policy_effective_date", "effective_date", "start_date"]:
            if key in d and d[key] is not None:
                d["policy_effective_date"] = str(d[key]).strip()
                break
        if "policy_effective_date" not in d or not d["policy_effective_date"]:
            d["policy_effective_date"] = today_str

        for key in [
            "policy_expiration_date",
            "expiration_date",
            "expiry_date",
            "end_date",
        ]:
            if key in d and d[key] is not None:
                d["policy_expiration_date"] = str(d[key]).strip()
                break
        if "policy_expiration_date" not in d or not d["policy_expiration_date"]:
            d["policy_expiration_date"] = next_year_str

        return d


class ReinsuranceSubmissionResponse(BaseCamelModel):
    id: str
    tracking_number: str
    tracking_id: Optional[str] = None
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
    risk_score: Optional[float] = None
    risk_tier: str = Field(default="MEDIUM")
    completeness_score: Optional[float] = Field(default=0.0)
    missing_flags_count: int = Field(default=0)
    flagged_fields: Optional[List[str]] = Field(default_factory=list)
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

    @model_validator(mode="before")
    @classmethod
    def _compute_submission_helpers(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "tracking_id" not in data or not data["tracking_id"]:
                data["tracking_id"] = data.get("tracking_number") or data.get("id")
            if "risk_score" not in data or data["risk_score"] is None:
                data["risk_score"] = data.get("overall_risk_score", 0.0)
            if "completeness_score" not in data or data["completeness_score"] is None:
                r_scores = data.get("risk_scores", [])
                if r_scores:
                    latest = r_scores[-1]
                    data["completeness_score"] = (
                        latest.get("completeness_score", 50.0)
                        if isinstance(latest, dict)
                        else getattr(latest, "completeness_score", 50.0)
                    )
                else:
                    data["completeness_score"] = 50.0
            if "flagged_fields" not in data or not data["flagged_fields"]:
                m_flags = data.get("missing_flags", [])
                data["flagged_fields"] = [
                    (
                        f.get("field_or_document_name")
                        if isinstance(f, dict)
                        else getattr(f, "field_or_document_name", str(f))
                    )
                    for f in m_flags
                    if (
                        not f.get("is_resolved", False)
                        if isinstance(f, dict)
                        else not getattr(f, "is_resolved", False)
                    )
                ]
            return data
        elif hasattr(data, "__dict__"):
            d = {c.name: getattr(data, c.name) for c in data.__table__.columns}
            d["tracking_id"] = getattr(data, "tracking_number", None) or getattr(
                data, "id", None
            )
            d["risk_score"] = getattr(data, "overall_risk_score", 0.0)

            r_scores = getattr(data, "risk_scores", [])
            if r_scores:
                latest = r_scores[-1]
                d["completeness_score"] = getattr(
                    latest, "completeness_score", 50.0
                )
            else:
                d["completeness_score"] = 50.0

            m_flags = getattr(data, "missing_flags", [])
            d["missing_flags"] = m_flags
            d["flagged_fields"] = [
                getattr(f, "field_or_document_name", "")
                for f in m_flags
                if not getattr(f, "is_resolved", False)
            ]

            d["risk_profile"] = getattr(data, "risk_profile", None)
            d["documents"] = getattr(data, "documents", [])
            d["risk_scores"] = r_scores
            d["decisions"] = getattr(data, "decisions", [])
            d["audit_logs"] = getattr(data, "audit_logs", [])
            return d
        return data


class QueueItemResponse(BaseCamelModel):
    id: str
    tracking_number: str
    tracking_id: Optional[str] = None
    insured_name: str
    risk_type: str
    requested_limit: float
    attachment_point: float
    status: str
    overall_risk_score: float
    risk_score: Optional[float] = None
    risk_tier: str
    missing_flags_count: int
    created_at: Optional[datetime] = Field(default=None)

    @model_validator(mode="before")
    @classmethod
    def _compute_queue_helpers(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "tracking_id" not in data or not data["tracking_id"]:
                data["tracking_id"] = data.get("tracking_number") or data.get("id")
            if "risk_score" not in data or data["risk_score"] is None:
                data["risk_score"] = data.get("overall_risk_score", 0.0)
            if "requested_limit" not in data and "requested_reinsurance_limit" in data:
                data["requested_limit"] = data["requested_reinsurance_limit"]
            return data
        elif hasattr(data, "__dict__"):
            d = {c.name: getattr(data, c.name) for c in data.__table__.columns}
            d["tracking_id"] = getattr(data, "tracking_number", None) or getattr(
                data, "id", None
            )
            d["risk_score"] = getattr(data, "overall_risk_score", 0.0)
            d["requested_limit"] = getattr(data, "requested_reinsurance_limit", 0.0)
            return d
        return data
