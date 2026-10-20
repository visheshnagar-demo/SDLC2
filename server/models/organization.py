import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True)
    org_type = Column(
        String(50), nullable=False, default="CEDING"
    )  # CEDING or REINSURER
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    users = relationship(
        "User", back_populates="organization", cascade="all, delete-orphan"
    )
    submissions = relationship(
        "Submission", back_populates="ceding_organization", cascade="all, delete-orphan"
    )
