from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.audit import AgentAuditLogResponse
from server.services.orchestrator_service import OrchestratorService

router = APIRouter(prefix="/api/v1/audit", tags=["Audit"])


@router.get("/logs/{job_id}", response_model=List[AgentAuditLogResponse])
def get_audit_logs(job_id: str, db: Session = Depends(get_db)):
    job = OrchestratorService.get_analysis(db=db, job_id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job with ID {job_id} not found",
        )

    logs = OrchestratorService.get_audit_logs(db=db, job_id=job_id)
    return logs
