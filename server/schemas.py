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

    model_config = ConfigDict(from_attributes=True, extra="allow")


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
            # Map mfa_implemented / mfa_enabled / mfa -> mfa_enforced
            mfa_val = (
                normalized.get("mfa_enforced")
                if normalized.get("mfa_enforced") is not None
                else normalized.get("mfa_implemented")
                if normalized.get("mfa_implemented") is not None
                else normalized.get("mfa_enabled")
                if normalized.get("mfa_enabled") is not None
                else normalized.get("mfa")
            )
            if mfa_val is not None:
                if isinstance(mfa_val, str):
                    normalized["mfa_enforced"] = mfa_val.lower() in ("true", "1", "yes")
                else:
                    normalized["mfa_enforced"] = bool(mfa_val)

            # Map prior_cyber_incidents_3yr / prior_losses / claims_count -> prior_losses_count
            plc = (
                normalized.get("prior_losses_count")
                if normalized.get("prior_losses_count") is not None
                else normalized.get("prior_cyber_incidents_3yr")
                if normalized.get("prior_cyber_incidents_3yr") is not None
                else normalized.get("prior_losses")
                if normalized.get("prior_losses") is not None
                else normalized.get("losses_count")
                if normalized.get("losses_count") is not None
                else normalized.get("claims_count")
                if normalized.get("claims_count") is not None
                else normalized.get("loss_count")
            )
            if plc is not None:
                try:
                    normalized["prior_losses_count"] = int(plc)
                except (ValueError, TypeError):
                    normalized["prior_losses_count"] = 0

            # Map total_loss_amount / loss_amount / claims_total
            tla = (
                normalized.get("total_loss_amount")
                if normalized.get("total_loss_amount") is not None
                else normalized.get("loss_amount")
                if normalized.get("loss_amount") is not None
                else normalized.get("total_losses")
                if normalized.get("total_losses") is not None
                else normalized.get("total_claims_amount")
                if normalized.get("total_claims_amount") is not None
                else normalized.get("claims_total")
            )
            if tla is not None:
                try:
                    normalized["total_loss_amount"] = float(tla)
                except (ValueError, TypeError):
                    normalized["total_loss_amount"] = 0.0

            # Map regulatory_investigation_pending / pending_claims -> has_pending_claims
            hpc = (
                normalized.get("has_pending_claims")
                if normalized.get("has_pending_claims") is not None
                else normalized.get("regulatory_investigation_pending")
                if normalized.get("regulatory_investigation_pending") is not None
                else normalized.get("pending_claims")
                if normalized.get("pending_claims") is not None
                else normalized.get("litigation_pending")
            )
            if hpc is not None:
                if isinstance(hpc, str):
                    normalized["has_pending_claims"] = hpc.lower() in (
                        "true",
                        "1",
                        "yes",
                    )
                else:
                    normalized["has_pending_claims"] = bool(hpc)

            # Map cloud_backup_frequency / offline_backups -> has_offline_backups
            if (
                "cloud_backup_frequency" in normalized
                and normalized.get("has_offline_backups") is None
            ):
                cbf = str(normalized["cloud_backup_frequency"]).upper()
                if cbf in (
                    "DAILY",
                    "REALTIME",
                    "CONTINUOUS",
                    "TRUE",
                    "1",
                    "YES",
                    "HOURLY",
                ):
                    normalized["has_offline_backups"] = True
                elif cbf in ("NONE", "FALSE", "0", "NO", "NEVER"):
                    normalized["has_offline_backups"] = False
            elif (
                "offline_backups" in normalized
                and normalized.get("has_offline_backups") is None
            ):
                normalized["has_offline_backups"] = bool(normalized["offline_backups"])

            # Map security_framework / framework / compliance_framework
            sf = (
                normalized.get("security_framework")
                or normalized.get("framework")
                or normalized.get("compliance_framework")
                or normalized.get("certification")
            )
            if sf:
                normalized["security_framework"] = str(sf)

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
    document_type: str = "PRIMARY_POLICY_SCHEDULE"
    file_name: str = "document.pdf"
    file_size_bytes: Optional[int] = 0
    file_url: Optional[str] = None
    is_verified: Optional[bool] = False
    status: Optional[str] = None
    uploaded: Optional[bool] = None

    model_config = ConfigDict(extra="allow", from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def normalize_doc_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            normalized = dict(data)
            dt = (
                normalized.get("document_type")
                or normalized.get("doc_type")
                or normalized.get("type")
                or normalized.get("category")
                or "PRIMARY_POLICY_SCHEDULE"
            )
            normalized["document_type"] = str(dt)

            fn = (
                normalized.get("file_name")
                or normalized.get("filename")
                or normalized.get("name")
                or normalized.get("file")
                or "document.pdf"
            )
            normalized["file_name"] = str(fn)

            sz = (
                normalized.get("file_size_bytes")
                if normalized.get("file_size_bytes") is not None
                else normalized.get("file_size")
                if normalized.get("file_size") is not None
                else normalized.get("size_bytes")
                if normalized.get("size_bytes") is not None
                else normalized.get("size")
            )
            if sz is not None:
                try:
                    normalized["file_size_bytes"] = int(sz)
                except (ValueError, TypeError):
                    normalized["file_size_bytes"] = 0
            else:
                normalized["file_size_bytes"] = 0

            url = (
                normalized.get("file_url")
                or normalized.get("url")
                or normalized.get("path")
            )
            if url:
                normalized["file_url"] = str(url)

            ver = (
                normalized.get("is_verified")
                if normalized.get("is_verified") is not None
                else normalized.get("verified")
                if normalized.get("verified") is not None
                else normalized.get("uploaded")
                if normalized.get("uploaded") is not None
                else (normalized.get("status") == "UPLOADED")
            )
            normalized["is_verified"] = bool(ver)
            return normalized
        return data


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
    score: Optional[float] = None
    composite_score: Optional[float] = None
    completeness_score: float
    exposure_score: float
    loss_score: float
    governance_score: float
    risk_tier: str
    scoring_breakdown: Optional[Dict[str, Any]] = None
    scored_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="allow")

    @model_validator(mode="before")
    @classmethod
    def populate_score_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            sc = data.get("overall_score") or data.get("score") or 0.0
            data["overall_score"] = float(sc)
            data["score"] = float(sc)
            data["composite_score"] = float(sc)
            return data
        return data


class MissingFlagResponse(BaseModel):
    id: str
    submission_id: str
    field_name: str
    flag_severity: str
    severity: Optional[str] = None
    description: str
    is_resolved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="allow")

    @model_validator(mode="before")
    @classmethod
    def populate_flag_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            sev = data.get("flag_severity") or data.get("severity") or "MEDIUM"
            data["flag_severity"] = str(sev)
            data["severity"] = str(sev)
            return data
        return data


# --- Decision Schemas ---


class DeclineReason(BaseModel):
    code: str
    label: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, extra="allow")


class DecisionCreate(BaseModel):
    decision_type: Literal["QUOTE", "DECLINE"] = "QUOTE"
    quoted_capacity: Optional[float] = None
    premium_rate_pct: Optional[float] = None
    quoted_premium: Optional[float] = None
    quote_validity_days: Optional[int] = 30
    decline_reason_code: Optional[str] = None
    underwriter_notes: Optional[str] = None

    model_config = ConfigDict(extra="allow", from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def normalize_decision_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            normalized = dict(data)
            dt = (
                normalized.get("decision_type")
                or normalized.get("decision")
                or normalized.get("type")
            )
            if dt is not None:
                dt_str = str(dt).upper()
                if any(k in dt_str for k in ("DECLINE", "REJECT")):
                    normalized["decision_type"] = "DECLINE"
                elif any(k in dt_str for k in ("QUOTE", "APPROVE", "ACCEPT")):
                    normalized["decision_type"] = "QUOTE"
                else:
                    raise ValueError(f"Invalid decision_type: {dt}")
            else:
                normalized["decision_type"] = "QUOTE"

            cap = (
                normalized.get("quoted_capacity")
                if normalized.get("quoted_capacity") is not None
                else normalized.get("capacity")
                if normalized.get("capacity") is not None
                else normalized.get("limit")
                if normalized.get("limit") is not None
                else normalized.get("amount")
            )
            if cap is not None:
                normalized["quoted_capacity"] = float(cap)

            rate = (
                normalized.get("premium_rate_pct")
                if normalized.get("premium_rate_pct") is not None
                else normalized.get("premium_rate")
                if normalized.get("premium_rate") is not None
                else normalized.get("rate_pct")
                if normalized.get("rate_pct") is not None
                else normalized.get("rate")
            )
            if rate is not None:
                normalized["premium_rate_pct"] = float(rate)

            prem = (
                normalized.get("quoted_premium")
                if normalized.get("quoted_premium") is not None
                else normalized.get("premium")
                if normalized.get("premium") is not None
                else normalized.get("amount_quoted")
            )
            if prem is not None:
                normalized["quoted_premium"] = float(prem)

            val_days = (
                normalized.get("quote_validity_days")
                if normalized.get("quote_validity_days") is not None
                else normalized.get("validity_days")
                if normalized.get("validity_days") is not None
                else normalized.get("valid_days")
            )
            if val_days is not None:
                normalized["quote_validity_days"] = int(val_days)
            else:
                normalized["quote_validity_days"] = 30

            code = (
                normalized.get("decline_reason_code")
                or normalized.get("decline_reason")
                or normalized.get("reason_code")
                or normalized.get("reason")
            )
            if code is not None:
                normalized["decline_reason_code"] = str(code)

            notes = (
                normalized.get("underwriter_notes")
                or normalized.get("notes")
                or normalized.get("comments")
                or normalized.get("comment")
            )
            if notes is not None:
                normalized["underwriter_notes"] = str(notes)

            return normalized
        return data


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
    risk_type: Optional[str] = "CYBER"
    insured_name: Optional[str] = "Insured Entity"
    industry_sector: Optional[str] = "Financial Services"
    annual_revenue: Optional[float] = 50000000.0
    primary_policy_limit: Optional[float] = 10000000.0
    requested_reinsurance_limit: Optional[float] = 5000000.0
    attachment_point: Optional[float] = 0.0
    sum_insured: Optional[float] = None
    requested_limit: Optional[float] = None
    primary_limit: Optional[float] = None
    retention: Optional[float] = None
    industry: Optional[str] = None
    sector: Optional[str] = None
    policy_effective_date: Optional[Union[date, str]] = None
    policy_expiration_date: Optional[Union[date, str]] = None
    effective_date: Optional[Union[date, str]] = None
    expiration_date: Optional[Union[date, str]] = None
    risk_profile: Optional[Union[RiskProfileCreate, Dict[str, Any]]] = None
    documents: Optional[List[Union[DocumentCreate, Dict[str, Any]]]] = Field(
        default_factory=list
    )

    model_config = ConfigDict(extra="allow", from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def normalize_submission_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            normalized = dict(data)

            # 1. Normalize risk_type
            raw_rt = (
                normalized.get("risk_type")
                or normalized.get("type")
                or normalized.get("line_of_business")
                or normalized.get("lob")
                or normalized.get("coverage_type")
                or normalized.get("class_of_business")
                or "CYBER"
            )
            if isinstance(raw_rt, str):
                rt_upper = (
                    raw_rt.upper()
                    .replace("&", "_AND_")
                    .replace("-", "_")
                    .replace(" ", "_")
                )
                if "CYBER" in rt_upper:
                    normalized["risk_type"] = "CYBER"
                elif any(
                    k in rt_upper for k in ("D_AND_O", "D_O", "DIRECTOR", "OFFICER")
                ):
                    normalized["risk_type"] = "D_AND_O"
                else:
                    normalized["risk_type"] = rt_upper
            else:
                normalized["risk_type"] = "CYBER"

            # 2. Normalize insured_name
            name = (
                normalized.get("insured_name")
                or normalized.get("company_name")
                or normalized.get("insured")
                or normalized.get("entity_name")
                or normalized.get("client_name")
                or normalized.get("name")
                or normalized.get("policyholder")
                or normalized.get("account_name")
                or "Insured Entity Corp"
            )
            normalized["insured_name"] = str(name)

            # 3. Normalize industry_sector
            ind = (
                normalized.get("industry_sector")
                or normalized.get("industry")
                or normalized.get("sector")
                or normalized.get("business_sector")
                or normalized.get("sector_type")
                or normalized.get("industry_type")
                or normalized.get("line_of_business")
                or "Financial Services"
            )
            normalized["industry_sector"] = str(ind)
            normalized["industry"] = str(ind)
            normalized["sector"] = str(ind)

            # 4. Normalize annual_revenue
            rev = (
                normalized.get("annual_revenue")
                if normalized.get("annual_revenue") is not None
                else normalized.get("revenue")
                if normalized.get("revenue") is not None
                else normalized.get("annual_turnover")
                if normalized.get("annual_turnover") is not None
                else normalized.get("turnover")
                if normalized.get("turnover") is not None
                else normalized.get("company_revenue")
                if normalized.get("company_revenue") is not None
                else normalized.get("gross_revenue")
            )
            if rev is not None:
                try:
                    normalized["annual_revenue"] = float(rev)
                except (ValueError, TypeError):
                    normalized["annual_revenue"] = 50000000.0
            else:
                normalized["annual_revenue"] = 50000000.0

            # 5. Normalize primary limits & requested reinsurance limits
            prim = (
                normalized.get("primary_policy_limit")
                if normalized.get("primary_policy_limit") is not None
                else normalized.get("primary_limit")
                if normalized.get("primary_limit") is not None
                else normalized.get("policy_limit")
                if normalized.get("policy_limit") is not None
                else normalized.get("sum_insured")
                if normalized.get("sum_insured") is not None
                else normalized.get("total_insured_value")
                if normalized.get("total_insured_value") is not None
                else normalized.get("insured_value")
            )

            req = (
                normalized.get("requested_reinsurance_limit")
                if normalized.get("requested_reinsurance_limit") is not None
                else normalized.get("requested_limit")
                if normalized.get("requested_limit") is not None
                else normalized.get("reinsurance_limit")
                if normalized.get("reinsurance_limit") is not None
                else normalized.get("fac_limit")
                if normalized.get("fac_limit") is not None
                else normalized.get("facultative_limit")
                if normalized.get("facultative_limit") is not None
                else normalized.get("treaty_limit")
                if normalized.get("treaty_limit") is not None
                else normalized.get("ceded_limit")
            )

            raw_sum_insured = normalized.get("sum_insured")

            if prim is not None:
                try:
                    prim_val = float(prim)
                except (ValueError, TypeError):
                    prim_val = 10000000.0
            elif raw_sum_insured is not None:
                try:
                    prim_val = float(raw_sum_insured)
                except (ValueError, TypeError):
                    prim_val = 10000000.0
            elif req is not None:
                try:
                    req_num = float(req)
                    prim_val = req_num * 2.0 if req_num > 0 else req_num
                except (ValueError, TypeError):
                    prim_val = 10000000.0
            else:
                prim_val = 10000000.0

            if req is not None:
                try:
                    req_val = float(req)
                except (ValueError, TypeError):
                    req_val = 5000000.0
            elif raw_sum_insured is not None:
                try:
                    req_val = float(raw_sum_insured) * 0.5
                except (ValueError, TypeError):
                    req_val = 5000000.0
            elif prim_val > 0:
                req_val = prim_val * 0.5
            else:
                req_val = 5000000.0

            normalized["primary_policy_limit"] = prim_val
            normalized["primary_limit"] = prim_val
            normalized["sum_insured"] = prim_val
            normalized["requested_reinsurance_limit"] = req_val
            normalized["requested_limit"] = req_val

            # 6. Normalize attachment_point / retention
            att = (
                normalized.get("attachment_point")
                if normalized.get("attachment_point") is not None
                else normalized.get("retention")
                if normalized.get("retention") is not None
                else normalized.get("attachment")
                if normalized.get("attachment") is not None
                else normalized.get("deductible")
                if normalized.get("deductible") is not None
                else normalized.get("retention_amount")
                if normalized.get("retention_amount") is not None
                else normalized.get("excess_point")
            )
            if att is not None:
                try:
                    att_val = float(att)
                except (ValueError, TypeError):
                    att_val = 0.0
            else:
                att_val = 0.0

            normalized["attachment_point"] = att_val
            normalized["retention"] = att_val

            # 7. Dates
            eff = (
                normalized.get("policy_effective_date")
                or normalized.get("effective_date")
                or normalized.get("start_date")
                or normalized.get("inception_date")
                or normalized.get("policy_start_date")
            )
            exp = (
                normalized.get("policy_expiration_date")
                or normalized.get("expiration_date")
                or normalized.get("end_date")
                or normalized.get("expiry_date")
                or normalized.get("policy_end_date")
            )

            if not eff:
                eff = date.today().isoformat()
            normalized["policy_effective_date"] = eff
            normalized["effective_date"] = eff

            if not exp:
                if isinstance(eff, str):
                    try:
                        eff_d = date.fromisoformat(eff)
                    except Exception:
                        eff_d = date.today()
                elif isinstance(eff, date):
                    eff_d = eff
                else:
                    eff_d = date.today()
                try:
                    exp = date(eff_d.year + 1, eff_d.month, eff_d.day).isoformat()
                except ValueError:
                    exp = date(eff_d.year + 1, eff_d.month, 28).isoformat()

            normalized["policy_expiration_date"] = exp
            normalized["expiration_date"] = exp

            return normalized
        return data

    @field_validator("policy_expiration_date", "expiration_date")
    @classmethod
    def validate_dates(
        cls, v: Optional[Union[date, str]], info
    ) -> Optional[Union[date, str]]:
        if v is None:
            return v
        eff_raw = info.data.get("policy_effective_date") or info.data.get(
            "effective_date"
        )
        if eff_raw is not None:
            v_d = date.fromisoformat(v) if isinstance(v, str) else v
            eff_d = date.fromisoformat(eff_raw) if isinstance(eff_raw, str) else eff_raw
            if v_d < eff_d:
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
    industry: Optional[str] = None
    sector: Optional[str] = None
    annual_revenue: float
    primary_policy_limit: float
    primary_limit: Optional[float] = None
    sum_insured: Optional[float] = None
    requested_reinsurance_limit: float
    requested_limit: Optional[float] = None
    attachment_point: float
    retention: Optional[float] = None
    policy_effective_date: date
    policy_expiration_date: date
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    overall_risk_score: Optional[float] = None
    score: Optional[float] = None
    risk_tier: Optional[str] = None
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
    industry: Optional[str] = None
    sector: Optional[str] = None
    requested_limit: float
    requested_reinsurance_limit: Optional[float] = None
    primary_limit: Optional[float] = None
    primary_policy_limit: Optional[float] = None
    sum_insured: Optional[float] = None
    attachment_point: float
    retention: Optional[float] = None
    status: str
    overall_risk_score: Optional[float] = None
    score: Optional[float] = None
    risk_tier: Optional[str] = None
    missing_flags_count: int = 0
    missing_flags: List[Dict[str, Any]] = Field(default_factory=list)
    submitted_at: datetime
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra="allow")


class UnderwritingQueueResponse(BaseModel):
    items: List[UnderwritingQueueItem]
    total: int
    skip: int
    limit: int
