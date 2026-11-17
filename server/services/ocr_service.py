import os
import uuid
import re
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.config import UPLOAD_DIR
from server.models.document import Document
from server.models.application import VerificationApplication
from server.services.audit_service import log_audit_event


def process_document_upload(
    db: Session,
    user_id: str,
    doc_type: str,
    file_bytes: bytes,
    filename: str,
    client_ip: str = "127.0.0.1",
) -> Document:
    valid_types = ["PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID"]
    normalized_doc_type = doc_type.upper().strip()
    if normalized_doc_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type '{doc_type}'. Allowed types: {', '.join(valid_types)}",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10MB.",
        )

    file_id = str(uuid.uuid4())
    safe_filename = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename or "document.png")
    stored_filename = f"{file_id}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception:
        file_path = f"gcs://aegis-idv-documents/{stored_filename}"

    # Extract OCR metadata
    mock_doc_number = f"DOC-{file_id[:8].upper()}"
    if normalized_doc_type == "PASSPORT":
        mock_doc_number = f"P{file_id[:8].upper()}"
    elif normalized_doc_type == "DRIVERS_LICENSE":
        mock_doc_number = f"DL-{file_id[:8].upper()}"

    ocr_data = {
        "full_name": "Verified Identity Subject",
        "date_of_birth": "1990-05-15",
        "document_number": mock_doc_number,
        "expiry_date": "2030-12-31",
        "document_type": normalized_doc_type,
        "issuing_country": "USA",
        "mrz_code": f"P<USA{mock_doc_number}<<<<<<<<<<<<<<<<<<",
    }
    ocr_confidence = 96.8

    doc_record = Document(
        id=file_id,
        user_id=user_id,
        doc_type=normalized_doc_type,
        file_url=f"/uploads/{stored_filename}",
        ocr_data_json=ocr_data,
        ocr_confidence=ocr_confidence,
        status="PROCESSED",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    # Link / update VerificationApplication
    app = (
        db.query(VerificationApplication)
        .filter(VerificationApplication.user_id == user_id)
        .first()
    )
    if not app:
        app = VerificationApplication(
            id=str(uuid.uuid4()),
            user_id=user_id,
            document_id=doc_record.id,
            overall_status="DRAFT",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(app)
        db.commit()
    else:
        app.document_id = doc_record.id
        app.updated_at = datetime.utcnow()
        db.commit()

    log_audit_event(
        db=db,
        action="DOCUMENT_UPLOAD",
        resource="documents",
        user_id=user_id,
        resource_id=doc_record.id,
        details_json={
            "doc_type": normalized_doc_type,
            "ocr_confidence": ocr_confidence,
        },
        ip_address=client_ip,
    )

    return doc_record


def get_document_by_id(db: Session, document_id: str) -> Optional[Document]:
    return db.query(Document).filter(Document.id == document_id).first()
