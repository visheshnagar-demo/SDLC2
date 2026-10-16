import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Date, DateTime, JSON, func
from sqlalchemy.orm import relationship
from server.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    carrier_id = Column(String(64), nullable=False, index=True)
    carrier_name = Column(String(255), nullable=False)
    insured_name = Column(String(255), nullable=False, index=True)
    industry_sector = Column(String(100), nullable=False)
    annual_revenue = Column(Float, nullable=False)
    risk_type = Column(String(32), nullable=False, index=True)  # 'CYBER', 'D_AND_O'
    requested_limit = Column(Float, nullable=False)
    attachment_point = Column(Float, nullable=False)
    policy_effective_date = Column(Date, nullable=False)
    policy_expiration_date = Column(Date, nullable=False)
    status = Column(String(32), nullable=False, default="SUBMITTED", index=True)
    submission_payload = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    risk_score = relationship(
        "RiskScore",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )
    missing_info_flags = relationship(
        "MissingInfoFlag",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    attachments = relationship(
        "SubmissionAttachment",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
    decisions = relationship(
        "DecisionRecord",
        back_populates="submission",
        cascade="all, delete-orphan",
    )
