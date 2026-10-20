import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class SubmissionDocument(Base):
    __tablename__ = "submission_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("submissions.id"), nullable=False, index=True
    )
    document_type = Column(
        String(50), nullable=False
    )  # APPLICATION, LOSS_RUNS, FINANCIALS, SECURITY_AUDIT, HR_POLICIES, CREDENTIALING_REPORT, OTHER
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_size_bytes = Column(BigInteger, default=0, nullable=False)
    content_type = Column(String(100), default="application/pdf", nullable=False)
    is_mandatory = Column(Boolean, default=False, nullable=False)
    uploaded_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    submission = relationship("Submission", back_populates="documents")
    uploader = relationship("User")
