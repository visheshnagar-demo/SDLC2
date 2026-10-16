import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.database import Base


class MissingInfoFlag(Base):
    __tablename__ = "missing_info_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(
        String(36),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_key = Column(String(128), nullable=False)
    item_category = Column(String(32), nullable=False)  # 'FIELD', 'DOCUMENT', 'ATTESTATION'
    description = Column(String(512), nullable=False)
    severity = Column(String(16), nullable=False)  # 'BLOCKING', 'WARNING'
    is_resolved = Column(Boolean, nullable=False, default=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    submission = relationship("Submission", back_populates="missing_info_flags")
