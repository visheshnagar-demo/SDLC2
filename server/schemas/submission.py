from datetime import date, datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator
from server.schemas.risk_score import RiskScoreRead
from server.schemas.missing_info import MissingInfoFlagRead
from server.schemas.decision import DecisionRead


class AttachmentRead(BaseModel):
    id: str
    submission_id: str
    document_type: str
    file_name: str
    file_size_bytes: int
    file_path: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttachmentCreate(BaseModel):
    document_type: str
    file_name: str
    file_size_bytes: Optional[int] = 0
    file_path: str


class SubmissionCreate(BaseModel):
    carrier_id: str = Field(..., min_length=1)
    carrier_name: str = Field(..., min_length=1)
    insured_name: str = Field(..., min_length=1)
    industry_sector: str = Field(..., min_length=1)
    annual_revenue: float = Field(..., gt=0)
    risk_type: Literal["CYBER", "D_AND_O"]
    requested_limit: float = Field(..., gt=0)
    attachment_point: float = Field(..., ge=0)
    policy_effective_date: date
    policy_expiration_date: date
    risk_parameters: Optional[Dict[str, Any]] = None
    attachments: Optional[List[AttachmentCreate]] = None

    @model_validator(mode="after")
    def validate_dates(self) -> "SubmissionCreate":
        if self.policy_expiration_date <= self.policy_effective_date:
            raise ValueError("policy_expiration_date must be after policy_effective_date")
        return self


class SubmissionUpdate(BaseModel):
    status: Optional[str] = None
    risk_parameters: Optional[Dict[str, Any]] = None
    requested_limit: Optional[float] = None
    attachment_point: Optional[float] = None


class SubmissionRead(BaseModel):
    id: str
    carrier_id: str
    carrier_name: str
    insured_name: str
    industry_sector: str
    annual_revenue: float
    risk_type: str
    requested_limit: float
    attachment_point: float
    policy_effective_date: date
    policy_expiration_date: date
    status: str
    submission_payload: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    risk_score: Optional[RiskScoreRead] = None
    missing_info_flags: List[MissingInfoFlagRead] = []
    attachments: List[AttachmentRead] = []
    decisions: List[DecisionRead] = []

    model_config = ConfigDict(from_attributes=True)


class QueueItem(BaseModel):
    submission_id: str
    carrier_id: str
    carrier_name: str
    insured_name: str
    industry_sector: str
    risk_type: str
    requested_limit: float
    attachment_point: float
    composite_score: Optional[int] = None
    risk_tier: Optional[str] = None
    missing_flags_count: int
    blocking_flags_count: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QueueResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[QueueItem]


class SubmissionListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[SubmissionRead]
