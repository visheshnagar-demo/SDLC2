import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from server.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quote_number = Column(String(50), unique=True, index=True, nullable=False)
    submission_id = Column(
        String(36), ForeignKey("submissions.id"), nullable=False, index=True
    )
    created_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    share_offered_pct = Column(Float, nullable=False)  # e.g. 50.0 (%)
    reinsurance_exposed_limit = Column(Float, nullable=False)
    ceding_commission_pct = Column(Float, nullable=False)  # e.g. 20.0 (%)
    proposed_gross_premium = Column(Float, nullable=False)
    gross_reinsurance_premium = Column(Float, nullable=False)
    reinsurance_premium = Column(Float, nullable=False)  # Net reinsurance premium

    conditions = Column(Text, nullable=True)
    exclusions = Column(JSON, nullable=True)  # List of clause keys or strings
    status = Column(
        String(50), default="ISSUED", nullable=False
    )  # DRAFT, ISSUED, ACCEPTED, DECLINED, SUPERSEDED
    valid_until = Column(Date, nullable=False)

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    submission = relationship("Submission", back_populates="quotes")
    creator = relationship("User")
