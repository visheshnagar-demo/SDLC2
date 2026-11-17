from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel


class AuditLogItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    resource: str
    resource_id: Optional[str] = None
    details_json: Optional[Dict[str, Any]] = None
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    total: int
    items: List[AuditLogItem]
