from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel


class ComplianceApplicationItem(BaseModel):
    application_id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    document_id: Optional[str] = None
    biometric_id: Optional[str] = None
    flag_reason: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None


class ComplianceApplicationListResponse(BaseModel):
    total: int
    items: List[ComplianceApplicationItem]


class ComplianceApplicationDetailResponse(BaseModel):
    application_id: str
    status: str
    flag_reason: Optional[str] = None
    user: Optional[Dict[str, Any]] = None
    document: Optional[Dict[str, Any]] = None
    biometrics: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ComplianceDecisionRequest(BaseModel):
    decision: str  # APPROVED or REJECTED
    notes: str
    reason_code: str


class ComplianceDecisionResponse(BaseModel):
    review_id: str
    application_id: str
    decision: str
    reason_code: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime
