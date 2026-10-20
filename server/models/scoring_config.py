import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON
from server.database import Base


class ScoringRuleConfig(Base):
    __tablename__ = "scoring_rule_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    line_of_business = Column(
        String(50), unique=True, index=True, nullable=False
    )  # CYBER, DO, EO, EPLI, MEDMAL
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    max_score = Column(Integer, default=100, nullable=False)
    rules_json = Column(
        JSON, nullable=False
    )  # List of factors, weights, criteria, and mandatory documents
    authority_limit_threshold = Column(Float, default=5000000.0, nullable=False)
    warning_sla_hours = Column(Float, default=24.0, nullable=False)
    breach_sla_hours = Column(Float, default=48.0, nullable=False)

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
