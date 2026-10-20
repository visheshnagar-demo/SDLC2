from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UnderwritingDecisionBase(BaseModel):
    document_id: str
    decision: str
    underwriter_id: str
    reviewer_notes: str
    subjectivities: Optional[str] = None


class UnderwritingDecisionCreate(UnderwritingDecisionBase):
    pass


class DecisionResponse(UnderwritingDecisionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
