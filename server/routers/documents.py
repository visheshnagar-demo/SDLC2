from typing import Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status,
    Query,
)
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.document import (
    DocumentResponse,
    DocumentDetailResponse,
    DocumentListResponse,
)
from server.services.document_service import DocumentService

router = APIRouter(prefix="/api/v1/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    file_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name cannot be empty",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    # Determine file type
    detected_type = file_type or file.filename.split(".")[-1].upper()
    if not detected_type:
        detected_type = "PDF"

    doc = DocumentService.upload_document(
        db=db,
        file_name=file.filename,
        file_type=detected_type,
        file_bytes=content,
    )
    return doc


@router.get("", response_model=DocumentListResponse)
def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    docs, total = DocumentService.list_documents(
        db=db, skip=skip, limit=limit, status=status
    )
    return DocumentListResponse(
        items=docs,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{doc_id}", response_model=DocumentDetailResponse)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = DocumentService.get_document(db=db, doc_id=doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {doc_id} not found",
        )
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    deleted = DocumentService.delete_document(db=db, doc_id=doc_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {doc_id} not found",
        )
    return None
