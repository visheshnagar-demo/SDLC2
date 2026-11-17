from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from server.schemas.submission import (
    SubmissionResponse,
    AttachmentResponse,
    RiskScoreRuleResponse,
    MissingFlagResponse,
)
from server.schemas.decision import DecisionResponse


class DeclineReason(BaseModel):
    code: str
    category: str
    description: str


class LockRequest(BaseModel):
    action: str = "lock"  # "lock" or "unlock"


class LockResponse(BaseModel):
    submission_id: str
    is_locked: bool
    locked_by_user_id: Optional[str] = None
    locked_by_user_name: Optional[str] = None
    locked_at: Optional[datetime] = None
    message: str


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entity_type: str
    entity_id: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    action: str
    details: Optional[str] = None
    created_at: datetime


class SubmissionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    submission: SubmissionResponse
    attachments: List[AttachmentResponse] = []
    risk_score_breakdown: List[RiskScoreRuleResponse] = []
    missing_flags: List[MissingFlagResponse] = []
    decisions: List[DecisionResponse] = []
    audit_logs: List[AuditLogResponse] = []


class QueueItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_id: Optional[str] = None
    carrier_name: Optional[str] = None
    insured_name: str
    industry_segment: str
    risk_type: str
    sum_insured: float
    attachment_point: float
    risk_score: float
    risk_tier: str
    status: str
    missing_flags_count: int = 0
    active_lock_user_id: Optional[str] = None
    active_lock_user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
