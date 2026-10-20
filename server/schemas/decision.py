from typing import Optional
from pydantic import BaseModel


class StatusTransitionRequest(BaseModel):
    target_status: str
    reason: Optional[str] = None
    notes: Optional[str] = None


class ReferralDecisionRequest(BaseModel):
    decision: str  # APPROVED, REJECTED
    notes: Optional[str] = None


class FinalDecisionRequest(BaseModel):
    decision: str  # BOUND, DECLINED
    decline_reason_code: Optional[str] = (
        None  # Mandatory if DECLINED (e.g. PRICING_MISALIGNMENT, CAPACITY_LIMIT, CONTROL_DEFICIENCY, CLAIMS_HISTORY, SANCTIONS)
    )
    notes: Optional[str] = None
