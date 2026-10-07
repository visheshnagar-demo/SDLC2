import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class AssortmentApproval(Base):
    __tablename__ = "assortment_approvals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_id = Column(
        String(36),
        ForeignKey("clusters.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    scenario_name = Column(String(50), nullable=False)
    manager_user_id = Column(String(100), nullable=False)
    manager_email = Column(String(255), nullable=False)
    audit_ref_id = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(String(30), nullable=False, default="APPROVED")
    guardrail_results_json = Column(JSON, nullable=False)
    sku_actions_json = Column(JSON, nullable=False)
    projected_impact_json = Column(JSON, nullable=False)
    notes = Column(Text, nullable=True)
    approved_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    cluster = relationship("Cluster", back_populates="approvals")
