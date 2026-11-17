import csv
import io
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from server.models.audit import AuditLog


def log_audit_event(
    db: Session,
    action: str,
    resource: str,
    user_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    details_json: Optional[Dict[str, Any]] = None,
    ip_address: str = "127.0.0.1",
) -> AuditLog:
    entry = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details_json=details_json or {},
        ip_address=ip_address,
        timestamp=datetime.utcnow(),
    )
    try:
        db.add(entry)
        db.commit()
        db.refresh(entry)
    except Exception:
        db.rollback()
    return entry


def get_audit_logs(
    db: Session,
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[int, List[AuditLog]]:
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if from_date:
        try:
            dt_from = datetime.fromisoformat(from_date.replace("Z", "+00:00"))
            query = query.filter(AuditLog.timestamp >= dt_from)
        except Exception:
            pass
    if to_date:
        try:
            dt_to = datetime.fromisoformat(to_date.replace("Z", "+00:00"))
            query = query.filter(AuditLog.timestamp <= dt_to)
        except Exception:
            pass

    total = query.count()
    items = query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()
    return total, items


def export_audit_logs_content(
    db: Session,
    export_format: str = "json",
    action: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> tuple[str, str]:
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if from_date:
        try:
            dt_from = datetime.fromisoformat(from_date.replace("Z", "+00:00"))
            query = query.filter(AuditLog.timestamp >= dt_from)
        except Exception:
            pass
    if to_date:
        try:
            dt_to = datetime.fromisoformat(to_date.replace("Z", "+00:00"))
            query = query.filter(AuditLog.timestamp <= dt_to)
        except Exception:
            pass

    items = query.order_by(desc(AuditLog.timestamp)).all()

    if export_format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "id",
                "user_id",
                "action",
                "resource",
                "resource_id",
                "ip_address",
                "timestamp",
                "details_json",
            ]
        )
        for item in items:
            writer.writerow(
                [
                    item.id,
                    item.user_id or "",
                    item.action,
                    item.resource,
                    item.resource_id or "",
                    item.ip_address,
                    item.timestamp.isoformat() if item.timestamp else "",
                    json.dumps(item.details_json or {}),
                ]
            )
        return output.getvalue(), "text/csv"
    else:
        log_dicts = [
            {
                "id": item.id,
                "user_id": item.user_id,
                "action": item.action,
                "resource": item.resource,
                "resource_id": item.resource_id,
                "ip_address": item.ip_address,
                "timestamp": item.timestamp.isoformat() if item.timestamp else None,
                "details_json": item.details_json,
            }
            for item in items
        ]
        return json.dumps(log_dicts, indent=2), "application/json"
