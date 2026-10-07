import uuid
from sqlalchemy import (
    Column,
    String,
    Text,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_id = Column(
        String(36),
        ForeignKey("clusters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scenario_key = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    projected_sales_lift = Column(Numeric(5, 2), nullable=False)
    projected_pb_share = Column(Numeric(5, 2), nullable=False)
    projected_instock_rate = Column(Numeric(5, 2), nullable=False)
    projected_shelf_capacity = Column(Numeric(5, 2), nullable=False)
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("cluster_id", "scenario_key", name="uq_cluster_scenario"),
    )

    cluster = relationship("Cluster", back_populates="scenarios")
