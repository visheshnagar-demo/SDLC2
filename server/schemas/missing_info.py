from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MissingInfoFlagBase(BaseModel):
    item_key: str
    item_category: str = Field(..., description="FIELD, DOCUMENT, or ATTESTATION")
    description: str
    severity: str = Field(..., description="BLOCKING or WARNING")
    is_resolved: bool = False


class MissingInfoFlagCreate(MissingInfoFlagBase):
    pass


class MissingInfoFlagRead(MissingInfoFlagBase):
    id: str
    submission_id: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MissingInfoFlagUpdate(BaseModel):
    is_resolved: bool
