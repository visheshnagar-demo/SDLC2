import json
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


class DecisionCreate(BaseModel):
    decision_type: str = Field(..., description="Decision type: QUOTE or DECLINE")
    offered_capacity: Optional[float] = Field(
        None, description="Capacity offered in USD"
    )
    quoted_rate: Optional[float] = Field(
        None, description="Quoted rate percentage e.g. 3.5"
    )
    quoted_premium: Optional[float] = Field(
        None, description="Total quoted premium in USD"
    )
    terms_conditions: Optional[str] = Field(
        None, description="Underwriting terms and conditions"
    )
    exclusions: Optional[Any] = Field(
        default=[], description="List or string of specific exclusion clauses"
    )
    decline_reason_code: Optional[str] = Field(
        None, description="Standardized decline reason code"
    )
    decline_notes: Optional[str] = Field(
        None, description="Underwriter notes explaining decline"
    )

    # Optional alias fields
    submission_id: Optional[str] = None
    capacity: Optional[float] = None
    rate: Optional[float] = None
    premium: Optional[float] = None
    terms: Optional[str] = None
    decision: Optional[str] = None
    reason: Optional[str] = None
    reason_code: Optional[str] = None
    decline_reason: Optional[str] = None
    notes: Optional[str] = None
    comments: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def pre_process_decision(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        d = dict(data)

        # 1. Normalize decision_type
        raw_type = (
            d.get("decision_type")
            or d.get("decision")
            or d.get("type")
            or d.get("status")
            or d.get("action")
            or ""
        )
        raw_type_str = str(raw_type).upper().strip()
        if "QUOTE" in raw_type_str:
            d["decision_type"] = "QUOTE"
        elif "DECLINE" in raw_type_str or "REJECT" in raw_type_str:
            d["decision_type"] = "DECLINE"
        elif raw_type_str:
            d["decision_type"] = raw_type_str
        elif (
            "decline_reason_code" in d
            or "decline_reason" in d
            or "reason_code" in d
            or "reason" in d
        ):
            d["decision_type"] = "DECLINE"
        elif (
            "offered_capacity" in d
            or "capacity" in d
            or "quoted_rate" in d
            or "rate" in d
        ):
            d["decision_type"] = "QUOTE"
        else:
            d["decision_type"] = ""

        # 2. Normalize offered_capacity
        cap = (
            d.get("offered_capacity")
            if d.get("offered_capacity") is not None
            else d.get("capacity")
        )
        if cap is None:
            cap = d.get("limit") or d.get("offered_limit")
        if cap is not None:
            try:
                d["offered_capacity"] = float(cap)
            except (ValueError, TypeError):
                pass

        # 3. Normalize quoted_rate
        rate = (
            d.get("quoted_rate") if d.get("quoted_rate") is not None else d.get("rate")
        )
        if rate is None:
            rate = d.get("quoted_rate_percentage") or d.get("rate_pct")
        if rate is not None:
            try:
                d["quoted_rate"] = float(rate)
            except (ValueError, TypeError):
                pass

        # 4. Normalize quoted_premium
        prem = (
            d.get("quoted_premium")
            if d.get("quoted_premium") is not None
            else d.get("premium")
        )
        if prem is None:
            prem = d.get("quote_premium")
        if prem is not None:
            try:
                d["quoted_premium"] = float(prem)
            except (ValueError, TypeError):
                pass
        elif d.get("offered_capacity") is not None and d.get("quoted_rate") is not None:
            # Calculate premium if missing: capacity * rate / 100
            d["quoted_premium"] = round(
                d["offered_capacity"] * (d["quoted_rate"] / 100.0), 2
            )

        # 5. Normalize terms_conditions
        terms = d.get("terms_conditions") or d.get("terms") or d.get("conditions")
        if terms is not None:
            d["terms_conditions"] = str(terms)

        # 6. Normalize exclusions
        excl = d.get("exclusions") or d.get("exclusion_clauses")
        if isinstance(excl, str):
            try:
                d["exclusions"] = json.loads(excl)
            except Exception:
                d["exclusions"] = [s.strip() for s in excl.split(",") if s.strip()]
        elif isinstance(excl, list):
            d["exclusions"] = excl

        # 7. Normalize decline_reason_code
        code = (
            d.get("decline_reason_code")
            or d.get("reason_code")
            or d.get("reason")
            or d.get("decline_reason")
            or d.get("decline_reasons")
            or d.get("code")
        )
        if isinstance(code, list) and len(code) > 0:
            code = code[0]
        if code is not None and str(code).strip():
            d["decline_reason_code"] = str(code).strip().upper()

        # 8. Normalize decline_notes
        notes = (
            d.get("decline_notes")
            or d.get("notes")
            or d.get("comments")
            or d.get("reason_notes")
            or d.get("decline_notes_detail")
        )
        if notes is not None:
            d["decline_notes"] = str(notes)

        return d

    @model_validator(mode="after")
    def validate_decision_payload(self):
        d_type = (self.decision_type or "").upper().strip()
        if d_type not in ("QUOTE", "DECLINE"):
            raise ValueError("decision_type must be either 'QUOTE' or 'DECLINE'")
        self.decision_type = d_type

        if d_type == "DECLINE":
            if (
                not self.decline_reason_code
                or not str(self.decline_reason_code).strip()
            ):
                raise ValueError(
                    "decline_reason_code is required for DECLINE decisions"
                )
        elif d_type == "QUOTE":
            if self.offered_capacity is not None and self.offered_capacity <= 0:
                raise ValueError("offered_capacity must be greater than 0")
        return self


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    decision_type: str
    offered_capacity: Optional[float] = None
    quoted_rate: Optional[float] = None
    quoted_premium: Optional[float] = None
    terms_conditions: Optional[str] = None
    exclusions: Optional[Any] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    created_at: datetime

    # Aliases
    decision: Optional[str] = None
    capacity: Optional[float] = None
    rate: Optional[float] = None
    premium: Optional[float] = None
    reason: Optional[str] = None
    reason_code: Optional[str] = None

    @field_validator("exclusions", mode="before")
    @classmethod
    def parse_exclusions_field(cls, v: Any) -> Any:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return [s.strip() for s in v.split(",") if s.strip()]
        return v

    @model_validator(mode="after")
    def set_decision_aliases(self):
        if not self.decision:
            self.decision = self.decision_type
        if self.capacity is None:
            self.capacity = self.offered_capacity
        if self.rate is None:
            self.rate = self.quoted_rate
        if self.premium is None:
            self.premium = self.quoted_premium
        if not self.reason:
            self.reason = self.decline_reason_code
        if not self.reason_code:
            self.reason_code = self.decline_reason_code
        return self


class DeclineReason(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    label: str
    category: str
    description: str


class DeclineReasonListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reasons: List[DeclineReason]
    total: int
