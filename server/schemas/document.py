from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    document_type: str
    file_name: str
    file_path: Optional[str] = None
    file_size_bytes: Optional[int] = 0
    content_type: Optional[str] = "application/pdf"
    is_mandatory: Optional[bool] = False


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    document_type: str
    file_name: str
    file_path: Optional[str] = None
    file_size_bytes: int
    content_type: str
    is_mandatory: bool
    uploaded_by_user_id: Optional[str] = None
    uploaded_at: datetime


class DocumentCheckResult(BaseModel):
    document_type: str
    is_required: bool
    is_present: bool
    file_name: Optional[str] = None
