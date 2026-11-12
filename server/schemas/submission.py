from typing import Optional, List, Any
from datetime import datetime, date
from pydantic import BaseModel, field_validator, model_validator, ConfigDict


def normalize_risk_type(raw_val: Any) -> Optional[str]:
    if raw_val is None:
        return None
    s = str(raw_val).strip()
    if not s:
        return None
    upper_s = s.upper()
    if "CYBER" in upper_s:
        return "CYBER"
    cleaned = (
        upper_s.replace("&", "")
        .replace("/", "")
        .replace("-", "")
        .replace("_", "")
        .replace(" ", "")
    )
    if cleaned in (
        "DO",
        "DAND_O",
        "DANDO",
        "DORISK",
        "DANDORISK",
        "DANDORISKS",
        "DORISKS",
        "DIRECTOR",
        "DIRECTORS",
        "DIRECTORSOFFICERS",
        "DIRECTORSANDOFFICERS",
        "DIRECTORANDOFFICER",
        "MANAGEMENTLIABILITY",
        "EXECUTIVELIABILITY",
        "EXECUTIVE",
        "OFFICER",
    ):
        return "DO"
    if "DIRECTOR" in upper_s or "EXECUTIVE" in upper_s or "OFFICER" in upper_s:
        return "DO"
    if upper_s in (
        "DO",
        "D&O",
        "D & O",
        "D/O",
        "D-O",
        "D_O",
        "D_AND_O",
        "D AND O",
        "DIRECTORS & OFFICERS",
        "DIRECTORS AND OFFICERS",
    ):
        return "DO"
    return upper_s


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
    @model_validator(mode="before")
    @classmethod
    def pre_process_cyber(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        d = dict(data)
        if "mfa" in d and "mfa_enabled" not in d:
            d["mfa_enabled"] = d["mfa"]
        if "mfa_details" in d and "mfa_enabled" not in d:
            d["mfa_enabled"] = bool(d["mfa_details"])
        if "has_mfa" in d and "mfa_enabled" not in d:
            d["mfa_enabled"] = d["has_mfa"]
        if "multi_factor_auth" in d and "mfa_enabled" not in d:
            d["mfa_enabled"] = d["multi_factor_auth"]

        if "edr" in d and "edr_implemented" not in d:
            d["edr_implemented"] = d["edr"]
        if "has_edr" in d and "edr_implemented" not in d:
            d["edr_implemented"] = d["has_edr"]
        if "endpoint_detection" in d and "edr_implemented" not in d:
            d["edr_implemented"] = d["endpoint_detection"]

        if "backups" in d and "offline_backups" not in d:
            d["offline_backups"] = d["backups"]
        if "immutable_backups" in d and "offline_backups" not in d:
            d["offline_backups"] = d["immutable_backups"]
        if "ransomware_controls" in d and "offline_backups" not in d:
            d["offline_backups"] = bool(d["ransomware_controls"])

        if "encryption" in d and "encryption_at_rest" not in d:
            d["encryption_at_rest"] = d["encryption"]
        if "encryption_enabled" in d and "encryption_at_rest" not in d:
            d["encryption_at_rest"] = d["encryption_enabled"]

        if "records" in d and "record_count" not in d:
            d["record_count"] = d["records"]
        if "sensitive_records" in d and "record_count" not in d:
            d["record_count"] = d["sensitive_records"]
        if "data_records" in d and "record_count" not in d:
            d["record_count"] = d["data_records"]

        if "ransomware_claims" in d and "prior_ransomware_claims" not in d:
            d["prior_ransomware_claims"] = d["ransomware_claims"]
        if "prior_claims" in d and "prior_ransomware_claims" not in d:
            d["prior_ransomware_claims"] = d["prior_claims"]
        if "has_ransomware_claims" in d and "prior_ransomware_claims" not in d:
            d["prior_ransomware_claims"] = d["has_ransomware_claims"]

        if "claims_amount" in d and "prior_claims_amount" not in d:
            d["prior_claims_amount"] = d["claims_amount"]
        if "loss_amount" in d and "prior_claims_amount" not in d:
            d["prior_claims_amount"] = d["loss_amount"]
        if "claim_amount" in d and "prior_claims_amount" not in d:
            d["prior_claims_amount"] = d["claim_amount"]

        if "training" in d and "security_training" not in d:
            d["security_training"] = d["training"]
        if "employee_training" in d and "security_training" not in d:
            d["security_training"] = d["employee_training"]

        return d


class CyberProfileResponse(CyberProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    created_at: datetime
    updated_at: datetime


class DoProfileBase(BaseModel):
    leverage_ratio: Optional[float] = None
    executive_turnover_rate: Optional[float] = None
    active_litigation: Optional[bool] = None
    litigation_details: Optional[str] = None
    independent_board_charter: Optional[bool] = None
    regulatory_investigations: Optional[bool] = None
    annual_revenue: Optional[float] = None


class DoProfileCreate(DoProfileBase):
    @model_validator(mode="before")
    @classmethod
    def pre_process_do(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        d = dict(data)
        if "leverage" in d and "leverage_ratio" not in d:
            d["leverage_ratio"] = d["leverage"]
        if "financial_leverage" in d and "leverage_ratio" not in d:
            d["leverage_ratio"] = d["financial_leverage"]
        if "debt_to_equity" in d and "leverage_ratio" not in d:
            d["leverage_ratio"] = d["debt_to_equity"]

        if "executive_turnover" in d and "executive_turnover_rate" not in d:
            d["executive_turnover_rate"] = d["executive_turnover"]
        if "turnover_rate" in d and "executive_turnover_rate" not in d:
            d["executive_turnover_rate"] = d["turnover_rate"]
        if "turnover" in d and "executive_turnover_rate" not in d:
            d["executive_turnover_rate"] = d["turnover"]
        if "high_executive_turnover" in d and "executive_turnover_rate" not in d:
            if d["high_executive_turnover"] is True:
                d["executive_turnover_rate"] = 30.0

        if "litigation" in d and "active_litigation" not in d:
            d["active_litigation"] = d["litigation"]
        if "has_litigation" in d and "active_litigation" not in d:
            d["active_litigation"] = d["has_litigation"]
        if "litigation_summary" in d and "litigation_details" not in d:
            d["litigation_details"] = d["litigation_summary"]
        if "litigation_notes" in d and "litigation_details" not in d:
            d["litigation_details"] = d["litigation_notes"]

        if "board_charter" in d and "independent_board_charter" not in d:
            d["independent_board_charter"] = d["board_charter"]
        if "board_oversight" in d and "independent_board_charter" not in d:
            d["independent_board_charter"] = d["board_oversight"]
        if "independent_board" in d and "independent_board_charter" not in d:
            d["independent_board_charter"] = d["independent_board"]

        if "regulatory_inquiries" in d and "regulatory_investigations" not in d:
            d["regulatory_investigations"] = d["regulatory_inquiries"]
        if "investigations" in d and "regulatory_investigations" not in d:
            d["regulatory_investigations"] = d["investigations"]

        if "revenue" in d and "annual_revenue" not in d:
            d["annual_revenue"] = d["revenue"]

        return d


class DoProfileResponse(DoProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    created_at: datetime
    updated_at: datetime


class MissingInfoFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    field_name: str
    flag_code: str
    description: str
    severity: str
    is_resolved: bool
    created_at: datetime


class RiskScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    overall_score: float
    risk_tier: str
    breakdown_json: Optional[str] = None
    calculated_at: datetime


class DecisionSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class SubmissionCreate(BaseModel):
    carrier_name: Optional[str] = "Standard Carrier Mutual"
    insured_name: Optional[str] = "Insured Entity Corp"
    risk_type: str = "CYBER"
    primary_limit: float = 1000000.0
    attachment_point: float = 0.0
    ceded_limit: Optional[float] = None
    carrier_premium: float = 50000.0
    policy_start_date: Optional[str] = "2026-06-01"
    policy_end_date: Optional[str] = "2027-06-01"
    cyber_profile: Optional[CyberProfileCreate] = None
    do_profile: Optional[DoProfileCreate] = None

    # Optional alias fields
    limit: Optional[float] = None
    premium: Optional[float] = None
    risk_category: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    cyber_risk_profile: Optional[CyberProfileCreate] = None
    do_risk_profile: Optional[DoProfileCreate] = None

    @model_validator(mode="before")
    @classmethod
    def pre_process_payload(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data

        d = dict(data)

        # 1. Normalize risk_type
        raw_risk = (
            d.get("risk_type")
            if d.get("risk_type") is not None
            else (d.get("risk_category") or d.get("type") or d.get("category"))
        )
        if raw_risk is not None:
            norm = normalize_risk_type(raw_risk)
            d["risk_type"] = norm if norm is not None else str(raw_risk).upper().strip()
        else:
            if (
                "do_profile" in d
                or "do_risk_profile" in d
                or "executive_turnover_rate" in d
                or "executive_turnover" in d
                or "leverage_ratio" in d
            ):
                d["risk_type"] = "DO"
            else:
                d["risk_type"] = "CYBER"

        # 2. Normalize primary_limit
        lim = (
            d.get("primary_limit")
            if d.get("primary_limit") is not None
            else d.get("limit")
        )
        if lim is None:
            lim = d.get("primary_limit_usd") or d.get("limit_amount")
        if lim is not None:
            try:
                d["primary_limit"] = float(lim)
            except (ValueError, TypeError):
                pass

        # 3. Normalize attachment_point
        att = (
            d.get("attachment_point")
            if d.get("attachment_point") is not None
            else d.get("attachment")
        )
        if att is None:
            att = d.get("attachment_point_usd") or 0.0
        try:
            d["attachment_point"] = float(att)
        except (ValueError, TypeError):
            d["attachment_point"] = 0.0

        # 4. Normalize ceded_limit
        ceded = (
            d.get("ceded_limit") if d.get("ceded_limit") is not None else d.get("ceded")
        )
        if ceded is None:
            ceded = d.get("ceded_limit_usd") or d.get("reinsurance_limit")
        if ceded is not None:
            try:
                d["ceded_limit"] = float(ceded)
            except (ValueError, TypeError):
                pass
        else:
            primary_val = d.get("primary_limit", 1000000.0)
            if primary_val and primary_val > 0:
                d["ceded_limit"] = primary_val * 0.5
            else:
                d["ceded_limit"] = 500000.0

        # 5. Normalize carrier_premium
        prem = (
            d.get("carrier_premium")
            if d.get("carrier_premium") is not None
            else d.get("premium")
        )
        if prem is None:
            prem = d.get("gross_premium") or d.get("premium_amount")
        if prem is not None:
            try:
                d["carrier_premium"] = float(prem)
            except (ValueError, TypeError):
                pass

        # 6. Normalize carrier_name and insured_name
        if "carrier_name" not in d and "carrier" in d:
            d["carrier_name"] = str(d["carrier"]).strip()
        if "insured_name" not in d and "insured" in d:
            d["insured_name"] = str(d["insured"]).strip()
        elif "insured_name" not in d and "company_name" in d:
            d["insured_name"] = str(d["company_name"]).strip()

        # 7. Normalize dates
        raw_start = (
            d.get("policy_start_date") or d.get("start_date") or d.get("effective_date")
        )
        raw_end = (
            d.get("policy_end_date") or d.get("end_date") or d.get("expiration_date")
        )

        def _format_date(val: Any, default: str) -> str:
            if not val:
                return default
            if isinstance(val, (datetime, date)):
                return val.strftime("%Y-%m-%d")
            s = str(val).strip()
            if "T" in s:
                s = s.split("T")[0]
            elif " " in s:
                s = s.split(" ")[0]
            return s

        if raw_start is not None:
            d["policy_start_date"] = _format_date(raw_start, "2026-06-01")
        if raw_end is not None:
            d["policy_end_date"] = _format_date(raw_end, "2027-06-01")

        # 8. Extract cyber_profile if nested under different names or at top level
        c_prof = d.get("cyber_profile") or d.get("cyber_risk_profile") or d.get("cyber")
        if not isinstance(c_prof, dict) and d.get("risk_type") == "CYBER":
            cyber_keys = {
                "mfa_enabled",
                "mfa",
                "mfa_details",
                "has_mfa",
                "multi_factor_auth",
                "edr_implemented",
                "edr",
                "has_edr",
                "endpoint_detection",
                "offline_backups",
                "backups",
                "immutable_backups",
                "ransomware_controls",
                "encryption_at_rest",
                "encryption",
                "encryption_enabled",
                "record_count",
                "records",
                "sensitive_records",
                "data_records",
                "prior_ransomware_claims",
                "ransomware_claims",
                "prior_claims",
                "has_ransomware_claims",
                "prior_claims_amount",
                "claims_amount",
                "loss_amount",
                "claim_amount",
                "security_training",
                "training",
                "employee_training",
            }
            if any(k in d for k in cyber_keys):
                c_prof = {k: d[k] for k in cyber_keys if k in d}
        if isinstance(c_prof, dict):
            d["cyber_profile"] = c_prof

        # 9. Extract do_profile if nested under different names or at top level
        d_prof = d.get("do_profile") or d.get("do_risk_profile") or d.get("do")
        if not isinstance(d_prof, dict) and d.get("risk_type") == "DO":
            do_keys = {
                "leverage_ratio",
                "leverage",
                "financial_leverage",
                "debt_to_equity",
                "executive_turnover_rate",
                "executive_turnover",
                "turnover_rate",
                "turnover",
                "high_executive_turnover",
                "active_litigation",
                "litigation",
                "has_litigation",
                "litigation_details",
                "litigation_summary",
                "litigation_notes",
                "independent_board_charter",
                "board_charter",
                "board_oversight",
                "independent_board",
                "regulatory_investigations",
                "regulatory_inquiries",
                "investigations",
                "annual_revenue",
                "revenue",
            }
            if any(k in d for k in do_keys):
                d_prof = {k: d[k] for k in do_keys if k in d}
        if isinstance(d_prof, dict):
            d["do_profile"] = d_prof

        return d

    @field_validator("risk_type", mode="before")
    @classmethod
    def validate_risk_type(cls, v: Any) -> str:
        if v is None:
            return "CYBER"
        norm = normalize_risk_type(v)
        if norm not in ("CYBER", "DO"):
            raise ValueError(f"risk_type must be either 'CYBER' or 'DO', got '{v}'")
        return norm


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

    # Client-facing aliases
    risk_category: Optional[str] = None
    limit: Optional[float] = None
    premium: Optional[float] = None

    @model_validator(mode="before")
    @classmethod
    def populate_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "risk_category" not in data and "risk_type" in data:
                data["risk_category"] = data["risk_type"]
            if "limit" not in data and "primary_limit" in data:
                data["limit"] = data["primary_limit"]
            if "premium" not in data and "carrier_premium" in data:
                data["premium"] = data["carrier_premium"]
        return data


class SubmissionListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[SubmissionResponse]
    total: int
    skip: int
    limit: int
