import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from server.database import Base


class VerificationApplication(Base):
    __tablename__ = "verification_applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    biometric_id = Column(String(36), ForeignKey("biometrics.id"), nullable=True)
    overall_status = Column(
        String(50), nullable=False, default="DRAFT"
    )  # DRAFT, AUTO_VERIFIED, FLAGGED, APPROVED, REJECTED
    flag_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
