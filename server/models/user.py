import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(
        String(50), nullable=False, default="RE_UNDERWRITER"
    )  # CEDING_UNDERWRITER, RE_UNDERWRITER, UNDERWRITING_MANAGER
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    authority_limit = Column(Float, nullable=False, default=5000000.0)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    organization = relationship("Organization", back_populates="users")
    created_submissions = relationship(
        "Submission",
        foreign_keys="Submission.created_by_user_id",
        back_populates="creator",
    )
    assigned_submissions = relationship(
        "Submission",
        foreign_keys="Submission.assigned_underwriter_id",
        back_populates="assigned_underwriter",
    )
    audit_logs = relationship("SubmissionAuditLog", back_populates="actor")
