import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class SubmissionAttachment(Base):
    __tablename__ = "submission_attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(128), nullable=False)
    file_size = Column(Integer, default=0, nullable=False)
    file_url = Column(String(512), nullable=False)
    document_category = Column(String(128), default="SUPPORTING_DOC", nullable=False)
    uploaded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    submission = relationship("ReinsuranceSubmission", back_populates="attachments")
