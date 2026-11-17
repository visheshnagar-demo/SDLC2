import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from server.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    doc_type = Column(
        String(50), nullable=False
    )  # PASSPORT, DRIVERS_LICENSE, NATIONAL_ID
    file_url = Column(String(1024), nullable=False)
    ocr_data_json = Column(JSON, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    status = Column(
        String(50), nullable=False, default="PENDING"
    )  # PENDING, PROCESSED, FAILED, FLAGGED
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
