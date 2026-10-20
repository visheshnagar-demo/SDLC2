from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AgentAuditLogBase(BaseModel):
    analysis_job_id: str
    agent_name: str
    step_name: str
    execution_status: str
    execution_time_ms: int = 0
    details: Optional[str] = None


class AgentAuditLogCreate(AgentAuditLogBase):
    pass


class AgentAuditLogResponse(AgentAuditLogBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
