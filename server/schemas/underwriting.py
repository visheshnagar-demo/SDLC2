from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from server.schemas.submission import (
    SubmissionResponse,
    AttachmentResponse,
    MissingFlagResponse,
    RiskScoreBreakdownResponse,
)
from server.schemas.decision import DecisionResponse


class LockRequest(BaseModel):
    action: str  # ACQUIRE or RELEASE


class LockResponse(BaseModel):
    locked: bool
    locked_by: Optional[str] = None
    locked_at: Optional[datetime] = None


class UnderwritingQueueItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_name: Optional[str] = None
    carrier_company: Optional[str] = None
    insured_name: str
    industry_segment: str
    risk_type: str
    annual_revenue: float
    sum_insured: float
    attachment_point: float
    risk_score: Optional[int] = None
    risk_tier: Optional[str] = None
    status: str
    missing_flags: List[MissingFlagResponse] = []
    active_lock_user_id: Optional[str] = None
    locked_at: Optional[datetime] = None
    created_at: datetime


class UnderwritingQueueResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[UnderwritingQueueItem]


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    entity_id: str
    action: str
    actor_user_id: str
    actor_role: str
    state_diff_json: Optional[str] = None
    timestamp: datetime


class UnderwritingSubmissionDetail(SubmissionResponse):
    carrier_company: Optional[str] = None
    attachments: List[AttachmentResponse] = []
    missing_flags: List[MissingFlagResponse] = []
    risk_score_breakdowns: List[RiskScoreBreakdownResponse] = []
    decision: Optional[DecisionResponse] = None
    audit_logs: List[AuditLogResponse] = []
