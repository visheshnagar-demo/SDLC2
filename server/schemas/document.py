from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    file_name: str
    file_type: str
    file_size_bytes: int
    status: str = "PENDING_INGESTION"
    extracted_metadata: Optional[Dict[str, Any]] = None


class DocumentCreate(DocumentBase):
    storage_path: str


class DocumentResponse(DocumentBase):
    id: str
    storage_path: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentSummary(BaseModel):
    id: str
    file_name: str
    file_type: str
    file_size_bytes: int
    status: str
    extracted_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentDetailResponse(DocumentResponse):
    pass


class DocumentListResponse(BaseModel):
    items: List[DocumentSummary]
    total: int
    skip: int
    limit: int
