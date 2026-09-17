import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class ClusterModel(Base):
    __tablename__ = "clusters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    total_linear_feet = Column(Float, nullable=False, default=120.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    skus = relationship(
        "SnacksSkuModel", back_populates="cluster", cascade="all, delete-orphan"
    )
    plans = relationship(
        "AssortmentPlanModel", back_populates="cluster", cascade="all, delete-orphan"
    )
