import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class GuardrailPolicyModel(Base):
    __tablename__ = "guardrail_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_id = Column(String(36), ForeignKey("scenario_configs.id"), nullable=True)
    rule_key = Column(String(100), nullable=False, index=True)
    rule_name = Column(String(255), nullable=False)
    threshold_value = Column(Float, nullable=False)
    comparison_operator = Column(String(10), nullable=False, default=">=")  # ">=", "<="
    status = Column(String(50), nullable=False, default="ACTIVE")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    scenario = relationship("ScenarioConfigModel", back_populates="guardrails")
