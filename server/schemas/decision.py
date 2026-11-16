from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class DecisionCreate(BaseModel):
    decision: str = Field(..., description="QUOTE or DECLINE")
    capacity_offered: Optional[float] = Field(default=None, ge=0)
    rate_on_line_pct: Optional[float] = Field(default=None, ge=0, le=100)
    premium_amount: Optional[float] = Field(default=None, ge=0)
    binding_deadline: Optional[str] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None


class DecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    underwriter_id: str
    decision: str
    capacity_offered: Optional[float] = None
    rate_on_line_pct: Optional[float] = None
    premium_amount: Optional[float] = None
    binding_deadline: Optional[str] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    created_at: datetime


class DeclineReason(BaseModel):
    code: str
    name: str
    description: str
    category: str


STANDARD_DECLINE_REASONS = [
    DeclineReason(
        code="HIGH_EXPOSURE_AGGREGATION",
        name="High Exposure Aggregation",
        description="Aggregate exposure in this industry or region exceeds carrier capacity limits.",
        category="CAPACITY",
    ),
    DeclineReason(
        code="UNSATISFACTORY_LOSS_HISTORY",
        name="Unsatisfactory Loss History",
        description="Prior claim frequency or severity exceeds acceptable underwriting risk guidelines.",
        category="RISK_PROFILE",
    ),
    DeclineReason(
        code="INADEQUATE_SECURITY_CONTROLS",
        name="Inadequate Security & Governance Controls",
        description="Cyber security safeguards or governance measures do not meet minimum facultative underwriting standards.",
        category="TECHNICAL",
    ),
    DeclineReason(
        code="INSUFFICIENT_ATTACHMENT_POINT",
        name="Insufficient Attachment Point",
        description="Attachment point is too low for the requested limit and underlying risk severity.",
        category="PRICING_STRUCTURE",
    ),
    DeclineReason(
        code="PROHIBITED_INDUSTRY_SECTOR",
        name="Prohibited / Excluded Industry Sector",
        description="Risk operates in an excluded or restricted commercial sector.",
        category="ELIGIBILITY",
    ),
    DeclineReason(
        code="MISSING_CRITICAL_INFORMATION",
        name="Missing Critical Information / Unresolved Disclosures",
        description="Mandatory documentation and risk disclosures were not provided within the underwriting timeline.",
        category="DOCUMENTATION",
    ),
    DeclineReason(
        code="SANCTIONS_OR_REGULATORY_RESTRICTION",
        name="Sanctions / Regulatory Restriction",
        description="Insured or jurisdiction is subject to regulatory restrictions or sanctions.",
        category="COMPLIANCE",
    ),
]
