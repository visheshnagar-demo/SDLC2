from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
    Request,
)
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.schemas.document import DocumentUploadResponse, DocumentResponse
from server.services.ocr_service import process_document_upload, get_document_by_id
from server.dependencies import get_current_user, get_client_ip

router = APIRouter(prefix="/api/v1/documents", tags=["Documents & OCR"])


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    doc_record = process_document_upload(
        db=db,
        user_id=current_user.id,
        doc_type=doc_type,
        file_bytes=file_bytes,
        filename=file.filename or "id_document.png",
        client_ip=get_client_ip(request),
    )

    return DocumentUploadResponse(
        document_id=doc_record.id,
        doc_type=doc_record.doc_type,
        status=doc_record.status,
        ocr_data=doc_record.ocr_data_json,
        ocr_confidence=doc_record.ocr_confidence,
        file_url=doc_record.file_url,
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = get_document_by_id(db, document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )

    # Access check: customer can only view own document unless compliance or admin
    if current_user.role == "customer" and doc.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this document record.",
        )

    return DocumentResponse(
        document_id=doc.id,
        user_id=doc.user_id,
        doc_type=doc.doc_type,
        status=doc.status,
        ocr_data=doc.ocr_data_json,
        ocr_confidence=doc.ocr_confidence,
        file_url=doc.file_url,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )
