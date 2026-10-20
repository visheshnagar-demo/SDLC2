import os
import uuid
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from server.models import Document
from server.services.parser_service import ParserService
from server.config import settings


class DocumentService:
    @staticmethod
    def upload_document(
        db: Session,
        file_name: str,
        file_type: str,
        file_bytes: bytes,
    ) -> Document:
        os.makedirs(settings.STORAGE_DIR, exist_ok=True)
        doc_id = str(uuid.uuid4())
        file_ext = os.path.splitext(file_name)[1]
        storage_path = os.path.join(settings.STORAGE_DIR, f"{doc_id}_{file_name}")

        with open(storage_path, "wb") as f:
            f.write(file_bytes)

        status = "PENDING_INGESTION"
        extracted_metadata = None

        try:
            extracted_metadata = ParserService.parse_file(
                file_bytes, file_name, file_type
            )
            status = "PROCESSING"
        except Exception as e:
            status = "FAILED_PARSING"
            extracted_metadata = {"error": str(e)}

        doc = Document(
            id=doc_id,
            file_name=file_name,
            file_type=file_type.upper().replace(".", ""),
            file_size_bytes=len(file_bytes),
            storage_path=storage_path,
            status=status,
            extracted_metadata=extracted_metadata,
        )

        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def list_documents(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
    ) -> Tuple[List[Document], int]:
        query = db.query(Document)
        if status:
            query = query.filter(Document.status == status)

        total = query.count()
        docs = (
            query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
        )
        return docs, total

    @staticmethod
    def get_document(db: Session, doc_id: str) -> Optional[Document]:
        return db.query(Document).filter(Document.id == doc_id).first()

    @staticmethod
    def delete_document(db: Session, doc_id: str) -> bool:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return False
        if os.path.exists(doc.storage_path):
            try:
                os.remove(doc.storage_path)
            except OSError:
                pass
        db.delete(doc)
        db.commit()
        return True
