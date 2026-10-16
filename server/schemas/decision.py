from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field


class DecisionCreate(BaseModel):
    submission_id: str
    decision_type: Literal["QUOTE", "DECLINE", "REQUEST_INFO"]
    underwriter_id: str
    underwriter_name: str
    quoted_premium: Optional[float] = None
    quoted_limit: Optional[float] = None
    quoted_attachment_point: Optional[float] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None


class DecisionRead(BaseModel):
    id: str
    submission_id: str
    decision_type: str
    underwriter_id: str
    underwriter_name: str
    quoted_premium: Optional[float] = None
    quoted_limit: Optional[float] = None
    quoted_attachment_point: Optional[float] = None
    subjectivities: Optional[str] = None
    decline_reason_code: Optional[str] = None
    decline_notes: Optional[str] = None
    decided_at: datetime

    model_config = ConfigDict(from_attributes=True)
