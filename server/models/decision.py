import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.database import Base


class DecisionRecord(Base):
    __tablename__ = "decision_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    decision_type = Column(String(32), nullable=False)  # 'QUOTE', 'DECLINE', 'REQUEST_INFO'
    underwriter_id = Column(String(64), nullable=False)
    underwriter_name = Column(String(255), nullable=False)
    quoted_premium = Column(Float, nullable=True)
    quoted_limit = Column(Float, nullable=True)
    quoted_attachment_point = Column(Float, nullable=True)
    subjectivities = Column(Text, nullable=True)
    decline_reason_code = Column(String(64), nullable=True)
    decline_notes = Column(Text, nullable=True)

    decided_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    submission = relationship("Submission", back_populates="decisions")
