import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class SubmissionAttachment(Base):
    __tablename__ = "submission_attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False
    )
    document_category = Column(
        String(50), nullable=False
    )  # CYBER_ASSESSMENT, AUDITED_FINANCIALS, LOSS_RUNS, POLICY_WORDING, DIRECTORS_DISCLOSURE, OTHER
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    storage_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=utc_now, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="attachments")
