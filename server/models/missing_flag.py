import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class MissingInformationFlag(Base):
    __tablename__ = "missing_information_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("reinsurance_submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    field_name = Column(String(128), nullable=False)
    flag_type = Column(
        String(32), default="WARNING", nullable=False
    )  # 'WARNING', 'BLOCKING'
    message = Column(String(512), nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    submission = relationship("ReinsuranceSubmission", back_populates="missing_flags")
