from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# Carrier Profile Schemas
# ==========================================
class CarrierProfileBase(BaseModel):
    carrier_name: str
    am_best_rating: str = "A"
    contact_email: str
    contact_phone: Optional[str] = None


class CarrierProfileCreate(CarrierProfileBase):
    pass


class CarrierProfileResponse(CarrierProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Document Attachment Schemas
# ==========================================
class AttachmentCreateRequest(BaseModel):
    document_type: str  # LOSS_RUN, SECURITY_AUDIT, FINANCIAL_STATEMENT, BOARD_DISCLOSURE, POLICY_WORDING, OTHER
    file_name: str
    file_path: Optional[str] = None


class DocumentResponse(BaseModel):
    id: str
    submission_id: str
    document_type: str
    file_name: str
    file_path: str
    upload_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Missing Information Flag Schemas
# ==========================================
class MissingInfoFlagResponse(BaseModel):
    id: str
    submission_id: str
    flag_type: str  # FIELD, DOCUMENT
    field_or_doc_name: str
    description: str
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Underwriting Decision Schemas
# ==========================================
class QuoteDecisionRequest(BaseModel):
    submission_id: str
    premium_amount: float
    capacity_offered: float
    deductible_retention: float
    subjectivities: Optional[str] = None
    validity_period_days: Optional[int] = 30
    underwriter_id: Optional[str] = "UW-AGENT-01"
    notes: Optional[str] = None


class DeclineDecisionRequest(BaseModel):
    submission_id: str
    decline_reason_code: str  # OUT_OF_APPETITE, EXCESSIVE_LOSS_HISTORY, INADEQUATE_SECURITY_CONTROLS, HIGH_RISK_SCORE, INCOMPLETE_SUBMISSION, CAPACITY_CONSTRAINTS
    underwriter_id: Optional[str] = "UW-AGENT-01"
    notes: Optional[str] = None


class UnderwritingDecisionResponse(BaseModel):
    id: str
    submission_id: str
    decision_type: str
    premium_amount: Optional[float] = None
    capacity_offered: Optional[float] = None
    deductible_retention: Optional[float] = None
    subjectivities: Optional[str] = None
    validity_period_days: Optional[int] = None
    decline_reason_code: Optional[str] = None
    underwriter_id: str
    notes: Optional[str] = None
    decision_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Submission Schemas
# ==========================================
class SubmissionCreateRequest(BaseModel):
    carrier_id: str
    risk_type: str  # CYBER, D_AND_O
    insured_name: str
    industry_sector: str = "General Commercial"
    annual_revenue: Optional[float] = 0.0
    employee_count: Optional[int] = 0
    limit_requested: float
    attachment_point: float
    retention: float
    effective_date: str
    expiry_date: str
    prior_loss_count: Optional[int] = 0
    prior_loss_total: Optional[float] = 0.0
    risk_attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)
    notes: Optional[str] = None


class SubmissionUpdateRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    risk_attributes: Optional[Dict[str, Any]] = None


class SubmissionResponse(BaseModel):
    id: str
    carrier_id: str
    risk_type: str
    insured_name: str
    industry_sector: str
    annual_revenue: Optional[float] = None
    employee_count: Optional[int] = None
    limit_requested: float
    attachment_point: float
    retention: float
    effective_date: str
    expiry_date: str
    prior_loss_count: int
    prior_loss_total: float
    risk_attributes: Optional[Dict[str, Any]] = None
    risk_score: int
    risk_tier: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    carrier: Optional[CarrierProfileResponse] = None
    documents: List[DocumentResponse] = []
    missing_flags: List[MissingInfoFlagResponse] = []
    decision: Optional[UnderwritingDecisionResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Underwriting Queue & Scoring Breakdown Schemas
# ==========================================
class QueueItemResponse(BaseModel):
    id: str
    carrier_id: str
    carrier_name: str
    risk_type: str
    insured_name: str
    industry_sector: str
    limit_requested: float
    attachment_point: float
    retention: float
    risk_score: int
    risk_tier: str
    status: str
    missing_flags_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScoringFactor(BaseModel):
    factor_name: str
    impact: str  # "POSITIVE", "NEUTRAL", "NEGATIVE"
    score_delta: int
    description: str


class ScoreBreakdownResponse(BaseModel):
    submission_id: str
    risk_score: int
    risk_tier: str
    base_score: int
    factors: List[ScoringFactor]
    recommendation: str


class ChecklistStatusResponse(BaseModel):
    submission_id: str
    total_checks: int
    passed_checks: int
    missing_flags: List[MissingInfoFlagResponse]
    is_complete: bool
