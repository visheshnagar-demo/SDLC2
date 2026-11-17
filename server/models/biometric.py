import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Float, DateTime, ForeignKey
from server.database import Base


class Biometric(Base):
    __tablename__ = "biometrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    selfie_image_url = Column(String(1024), nullable=False)
    liveness_passed = Column(Boolean, nullable=False, default=False)
    match_score = Column(Float, nullable=False, default=0.0)
    status = Column(
        String(50), nullable=False, default="PENDING"
    )  # VERIFIED, FLAGGED, FAILED, PENDING
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
