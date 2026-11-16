import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class SubmissionAttachment(Base):
    __tablename__ = "submission_attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False
    )
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False, default=0)
    file_path = Column(String(500), nullable=True)
    document_category = Column(
        String(50), nullable=False, default="OTHER"
    )  # FINANCIALS, LOSS_RUNS, SECURITY_AUDIT, POLICY_WORDING, OTHER
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="attachments")
    uploader = relationship("User", foreign_keys=[uploaded_by])
