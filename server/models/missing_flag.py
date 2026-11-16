import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base


class MissingInformationFlag(Base):
    __tablename__ = "missing_information_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36), ForeignKey("reinsurance_submissions.id"), nullable=False
    )
    field_name = Column(String(100), nullable=False)
    flag_type = Column(
        String(50), nullable=False, default="WARNING"
    )  # BLOCKING, WARNING
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("ReinsuranceSubmission", back_populates="missing_flags")
