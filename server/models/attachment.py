import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.database import Base


class SubmissionAttachment(Base):
    __tablename__ = "submission_attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    document_type = Column(String(64), nullable=False)  # 'LOSS_RUNS', 'SECURITY_AUDIT', 'FINANCIAL_STATEMENTS', 'QUESTIONNAIRE', 'OTHER'
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False, default=0)
    file_path = Column(String(512), nullable=False)

    uploaded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    submission = relationship("Submission", back_populates="attachments")
