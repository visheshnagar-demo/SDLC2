from datetime import date, datetime
from enum import Enum
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator


class RiskCategory(str, Enum):
    CYBER = "CYBER"
    DO = "DO"


class SubmissionStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    QUOTED = "QUOTED"
    DECLINED = "DECLINED"


class PriorityGrade(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DecisionType(str, Enum):
    QUOTE = "QUOTE"
    DECLINE = "DECLINE"


class AttachedDocumentCreate(BaseModel):
    document_type: str = Field(
        ..., description="E.g., CYBER_QUESTIONNAIRE, AUDITED_FINANCIALS, PRIMARY_POLICY"
    )
    file_name: str
    file_size_bytes: int = Field(gt=0)
    storage_uri: str


class SubmissionDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    document_type: str
    file_name: str
    file_size_bytes: int
    storage_uri: str
    uploaded_at: datetime


class SubmissionMissingFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    field_name: str
    flag_message: str
    is_blocking: bool
    is_resolved: bool
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime


class ResolveFlagRequest(BaseModel):
    underwriter_id: str = Field(
        ..., min_length=1, description="Underwriter resolving the flag"
    )


class ReinsuranceSubmissionCreate(BaseModel):
    carrier_name: str = Field(..., min_length=1)
    carrier_rating: str = Field(..., min_length=1)
    risk_category: RiskCategory
    policy_limit_usd: float = Field(
        ..., gt=0, description="Requested policy limit in USD"
    )
    attachment_point_usd: float = Field(
        ..., ge=0, description="Primary attachment point in USD"
    )
    effective_date: date
    expiration_date: date
    primary_policy_number: str = Field(..., min_length=1)
    insured_entity_name: str = Field(..., min_length=1)
    industry_sector: str = Field(..., min_length=1)
    prior_loss_amount_usd: float = Field(default=0.0, ge=0)
    attached_documents: Optional[List[AttachedDocumentCreate]] = Field(
        default_factory=list
    )

    @model_validator(mode="after")
    def validate_dates_and_amounts(self):
        if self.effective_date >= self.expiration_date:
            raise ValueError("effective_date must precede expiration_date")
        if self.policy_limit_usd <= 0:
            raise ValueError("policy_limit_usd must be greater than 0")
        if self.attachment_point_usd < 0:
            raise ValueError("attachment_point_usd must be non-negative")
        return self


class ReinsuranceSubmissionCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    status: str
    risk_category: str
    risk_score: float
    priority: str
    has_missing_info: bool
    missing_flags_count: int
    created_at: datetime


class UnderwritingDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    decision_id: Optional[str] = None
    submission_id: str
    decision: str
    status: Optional[str] = None
    underwriter_id: Optional[str] = None
    quoted_premium_usd: Optional[float] = None
    quoted_limit_usd: Optional[float] = None
    quoted_attachment_usd: Optional[float] = None
    decline_reason_code: Optional[str] = None
    notes: Optional[str] = None
    recorded_at: datetime

    @model_validator(mode="before")
    @classmethod
    def extract_fields(cls, data: Any) -> Any:
        if hasattr(data, "id") and not isinstance(data, dict):
            sub_status = (
                getattr(data.submission, "status", None)
                if getattr(data, "submission", None)
                else None
            )
            return {
                "id": str(data.id),
                "decision_id": str(data.id),
                "submission_id": str(data.submission_id),
                "decision": str(data.decision),
                "status": sub_status,
                "underwriter_id": data.underwriter_id,
                "quoted_premium_usd": data.quoted_premium_usd,
                "quoted_limit_usd": data.quoted_limit_usd,
                "quoted_attachment_usd": data.quoted_attachment_usd,
                "decline_reason_code": data.decline_reason_code,
                "notes": data.notes,
                "recorded_at": data.recorded_at,
            }
        elif isinstance(data, dict):
            if "id" in data and "decision_id" not in data:
                data["decision_id"] = data["id"]
            elif "decision_id" in data and "id" not in data:
                data["id"] = data["decision_id"]
        return data


class SubmissionQueueItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_name: str
    carrier_rating: str
    risk_category: str
    insured_entity_name: str
    industry_sector: str
    policy_limit_usd: float
    attachment_point_usd: float
    effective_date: date
    expiration_date: date
    primary_policy_number: str
    prior_loss_amount_usd: float
    risk_score: float
    priority: str
    status: str
    has_missing_info: bool
    missing_flags: List[SubmissionMissingFlagResponse] = Field(default_factory=list)
    documents: List[SubmissionDocumentResponse] = Field(default_factory=list)
    decisions: List[UnderwritingDecisionResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class UnderwritingQueueResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[SubmissionQueueItemResponse]


class RiskScoreRequest(BaseModel):
    risk_category: RiskCategory
    policy_limit_usd: float = Field(..., gt=0)
    attachment_point_usd: float = Field(..., ge=0)
    carrier_rating: str = Field(..., min_length=1)
    industry_sector: str = Field(..., min_length=1)
    prior_loss_amount_usd: float = Field(default=0.0, ge=0)


class RiskScoreBreakdown(BaseModel):
    exposure_score: float
    carrier_rating_penalty: float
    category_baseline: float
    loss_history_factor: float


class RiskScoreResponse(BaseModel):
    risk_score: float
    risk_grade: str
    priority: str
    breakdown: RiskScoreBreakdown


class UnderwritingDecisionCreate(BaseModel):
    submission_id: str = Field(..., min_length=1)
    underwriter_id: str = Field(..., min_length=1)
    decision: DecisionType
    quoted_premium_usd: Optional[float] = Field(default=None, ge=0)
    quoted_limit_usd: Optional[float] = Field(default=None, gt=0)
    quoted_attachment_usd: Optional[float] = Field(default=None, ge=0)
    decline_reason_code: Optional[str] = None
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_decision_details(self):
        if self.decision == DecisionType.QUOTE:
            if self.quoted_premium_usd is None or self.quoted_premium_usd <= 0:
                raise ValueError(
                    "quoted_premium_usd is required and must be > 0 when decision is QUOTE"
                )
            if self.quoted_limit_usd is None or self.quoted_limit_usd <= 0:
                raise ValueError(
                    "quoted_limit_usd is required and must be > 0 when decision is QUOTE"
                )
            if self.quoted_attachment_usd is None or self.quoted_attachment_usd < 0:
                raise ValueError(
                    "quoted_attachment_usd is required and must be >= 0 when decision is QUOTE"
                )
        elif self.decision == DecisionType.DECLINE:
            if not self.decline_reason_code:
                raise ValueError(
                    "decline_reason_code is required when decision is DECLINE"
                )
        return self
