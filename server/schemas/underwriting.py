from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from server.schemas.submission import SubmissionResponse
from server.schemas.decision import DecisionResponse


class LockRequest(BaseModel):
    action: str = Field(default="acquire", description="acquire or release")


class LockResponse(BaseModel):
    submission_id: str
    locked: bool
    active_lock_user_id: Optional[str] = None
    lock_expires_at: Optional[datetime] = None
    message: str


class UnderwritingQueueItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_reference: str
    carrier_id: str
    carrier_name: str
    insured_name: str
    risk_type: str
    sum_insured: float
    attachment_point: float
    risk_score: float
    risk_tier: str
    status: str
    missing_flags_count: int
    blocking_flags_count: int
    active_lock_user_id: Optional[str] = None
    created_at: datetime


class UnderwritingQueueResponse(BaseModel):
    total: int
    items: List[UnderwritingQueueItem]


class UnderwritingDetailResponse(BaseModel):
    submission: SubmissionResponse
    carrier_name: str
    carrier_email: str
    decisions: List[DecisionResponse] = []


class UnderwritingKPIResponse(BaseModel):
    total_submissions: int
    pending_review: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    quoted_count: int
    declined_count: int
