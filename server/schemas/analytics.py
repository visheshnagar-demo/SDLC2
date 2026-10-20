from typing import Dict, List, Any
from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class LOBExposure(BaseModel):
    line_of_business: str
    display_name: str
    count: int
    total_policy_limit: float
    total_exposed_capacity: float
    average_risk_score: float


class PendingReferralSummary(BaseModel):
    submission_id: str
    submission_number: str
    insured_name: str
    line_of_business: str
    policy_limit: float
    risk_score: int
    assigned_underwriter_name: str
    created_at: str


class ManagerDashboardDTO(BaseModel):
    total_capacity_exposed: float
    quote_to_bind_ratio: float
    average_turnaround_hours: float
    gross_written_premium: float
    net_reinsurance_premium: float
    total_submissions: int
    submissions_by_status: Dict[str, int]
    submissions_by_line: Dict[str, Any]
    lob_breakdown: List[LOBExposure]
    pending_referrals: List[PendingReferralSummary]
    sla_compliance_rate: float
