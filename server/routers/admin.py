from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.audit import AuditLogListResponse, AuditLogItem
from server.services.audit_service import get_audit_logs, export_audit_logs_content
from server.dependencies import require_role

router = APIRouter(prefix="/api/v1/admin", tags=["Admin & Audit Trail"])


@router.get(
    "/audit-logs",
    response_model=AuditLogListResponse,
    dependencies=[Depends(require_role(["admin"]))],
)
def list_audit_logs(
    action: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    total, items = get_audit_logs(
        db=db,
        action=action,
        user_id=user_id,
        from_date=from_date,
        to_date=to_date,
        skip=skip,
        limit=limit,
    )
    return AuditLogListResponse(
        total=total,
        items=[AuditLogItem.model_validate(item) for item in items],
    )


@router.get(
    "/audit-logs/export",
    dependencies=[Depends(require_role(["admin"]))],
)
def export_audit_logs(
    format: str = Query("json", regex="^(csv|json)$"),
    action: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    content, media_type = export_audit_logs_content(
        db=db,
        export_format=format,
        action=action,
        from_date=from_date,
        to_date=to_date,
    )
    filename = f"audit_logs_export.{format.lower()}"
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
