import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class MissingInformationFlag(Base):
    __tablename__ = "missing_information_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False
    )
    flag_code = Column(
        String(50), nullable=False
    )  # MISSING_ATTACHMENT, INCOMPLETE_LOSS_RUN, EXPIRED_DATE, MISSING_FIELD
    field_name = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)  # BLOCKING, WARNING
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="missing_flags")
