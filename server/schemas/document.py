from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    document_id: str
    doc_type: str
    status: str
    ocr_data: Optional[Dict[str, Any]] = None
    ocr_confidence: Optional[float] = None
    file_url: Optional[str] = None


class DocumentResponse(BaseModel):
    document_id: str
    user_id: Optional[str] = None
    doc_type: str
    status: str
    ocr_data: Optional[Dict[str, Any]] = None
    ocr_confidence: Optional[float] = None
    file_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
