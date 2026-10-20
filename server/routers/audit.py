from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.audit_log import SubmissionAuditLog
from server.schemas.submission import AuditLogResponse
from server.dependencies.auth import get_current_user
from server.models.user import User

router = APIRouter(tags=["Audit Trail"])


@router.get(
    "/api/v1/submissions/{id}/audit-trail", response_model=List[AuditLogResponse]
)
def get_submission_audit_trail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(SubmissionAuditLog)
        .filter(SubmissionAuditLog.submission_id == id)
        .order_by(SubmissionAuditLog.created_at.desc())
        .all()
    )


@router.get("/api/v1/audit-logs", response_model=List[AuditLogResponse])
def get_all_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(SubmissionAuditLog)
        .order_by(SubmissionAuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
