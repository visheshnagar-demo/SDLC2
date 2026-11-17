import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from server.models.application import VerificationApplication
from server.models.user import User
from server.models.document import Document
from server.models.biometric import Biometric
from server.models.compliance import ComplianceReview
from server.services.audit_service import log_audit_event


def list_compliance_applications(
    db: Session,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[int, List[Dict[str, Any]]]:
    query = db.query(VerificationApplication)
    if status_filter:
        query = query.filter(VerificationApplication.overall_status == status_filter)

    total = query.count()
    apps = (
        query.order_by(desc(VerificationApplication.updated_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = []
    for app in apps:
        user = db.query(User).filter(User.id == app.user_id).first()
        items.append(
            {
                "application_id": app.id,
                "user_id": app.user_id,
                "user_email": user.email if user else None,
                "user_name": user.full_name if user else None,
                "document_id": app.document_id,
                "biometric_id": app.biometric_id,
                "flag_reason": app.flag_reason,
                "status": app.overall_status,
                "created_at": app.created_at,
            }
        )
    return total, items


def get_compliance_application_detail(
    db: Session,
    application_id: str,
) -> Dict[str, Any]:
    app = (
        db.query(VerificationApplication)
        .filter(VerificationApplication.id == application_id)
        .first()
    )
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification application with ID '{application_id}' not found.",
        )

    user = db.query(User).filter(User.id == app.user_id).first()
    user_dict = None
    if user:
        user_dict = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }

    doc = None
    if app.document_id:
        doc_obj = db.query(Document).filter(Document.id == app.document_id).first()
        if doc_obj:
            doc = {
                "id": doc_obj.id,
                "doc_type": doc_obj.doc_type,
                "file_url": doc_obj.file_url,
                "ocr_data_json": doc_obj.ocr_data_json,
                "ocr_confidence": doc_obj.ocr_confidence,
                "status": doc_obj.status,
                "created_at": doc_obj.created_at.isoformat()
                if doc_obj.created_at
                else None,
            }

    biometric = None
    if app.biometric_id:
        bio_obj = db.query(Biometric).filter(Biometric.id == app.biometric_id).first()
        if bio_obj:
            biometric = {
                "id": bio_obj.id,
                "selfie_image_url": bio_obj.selfie_image_url,
                "liveness_passed": bio_obj.liveness_passed,
                "match_score": bio_obj.match_score,
                "status": bio_obj.status,
                "created_at": bio_obj.created_at.isoformat()
                if bio_obj.created_at
                else None,
            }

    return {
        "application_id": app.id,
        "status": app.overall_status,
        "flag_reason": app.flag_reason,
        "user": user_dict,
        "document": doc,
        "biometrics": biometric,
        "created_at": app.created_at,
        "updated_at": app.updated_at,
    }


def record_compliance_decision(
    db: Session,
    application_id: str,
    officer_id: str,
    decision: str,
    notes: str,
    reason_code: str,
    client_ip: str = "127.0.0.1",
) -> ComplianceReview:
    norm_decision = decision.upper().strip()
    if norm_decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decision must be either 'APPROVED' or 'REJECTED'.",
        )

    app = (
        db.query(VerificationApplication)
        .filter(VerificationApplication.id == application_id)
        .first()
    )
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification application with ID '{application_id}' not found.",
        )

    review = ComplianceReview(
        id=str(uuid.uuid4()),
        application_id=application_id,
        officer_id=officer_id,
        decision=norm_decision,
        reason_code=reason_code,
        notes=notes,
        created_at=datetime.utcnow(),
    )
    db.add(review)

    app.overall_status = norm_decision
    app.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(review)

    log_audit_event(
        db=db,
        action="COMPLIANCE_DECISION",
        resource="verification_applications",
        user_id=officer_id,
        resource_id=application_id,
        details_json={
            "decision": norm_decision,
            "reason_code": reason_code,
            "notes": notes,
            "review_id": review.id,
        },
        ip_address=client_ip,
    )

    return review
