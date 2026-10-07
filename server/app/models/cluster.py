import uuid
from sqlalchemy import Column, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_code = Column(String(50), unique=True, nullable=False, index=True)
    cluster_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    skus = relationship("Sku", back_populates="cluster", cascade="all, delete-orphan")
    scenarios = relationship(
        "Scenario", back_populates="cluster", cascade="all, delete-orphan"
    )
    approvals = relationship("AssortmentApproval", back_populates="cluster")
