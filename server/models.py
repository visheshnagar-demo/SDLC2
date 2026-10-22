import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(32), unique=True, nullable=False, index=True)
    scenario_id = Column(String(32), nullable=False, index=True)
    cedent_name = Column(String(128), nullable=False)
    line_of_business = Column(String(64), nullable=False)
    treaty_type = Column(String(64), nullable=False, default="Treaty Quota Share")
    requested_limit = Column(Float, nullable=False, default=0.0)
    retention_amount = Column(Float, nullable=False, default=0.0)
    historical_loss_ratio = Column(Float, nullable=True)
    current_stage = Column(String(64), nullable=False, default="SUBMISSION_INTAKE")
    status = Column(String(32), nullable=False, default="IN_PROGRESS")
    completeness_score = Column(Float, nullable=False, default=1.0)
    overall_confidence = Column(Float, nullable=False, default=0.95)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    extracted_fields = relationship(
        "ExtractedField",
        back_populates="case",
        cascade="all, delete-orphan",
        lazy="joined",
    )
    quotes = relationship(
        "Quote", back_populates="case", cascade="all, delete-orphan", lazy="joined"
    )
    stages = relationship(
        "StageStatus",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="StageStatus.stage_order",
        lazy="joined",
    )
    audit_logs = relationship(
        "AuditLog",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="AuditLog.timestamp.desc()",
        lazy="joined",
    )
    bind_checklist = relationship(
        "BindChecklist",
        back_populates="case",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined",
    )
    pricing_scenarios = relationship(
        "PricingScenario",
        back_populates="case",
        cascade="all, delete-orphan",
        lazy="joined",
    )


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    field_name = Column(String(64), nullable=False)
    extracted_value = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=False, default=0.90)
    source_document = Column(String(128), nullable=False)
    source_citation_page = Column(Integer, nullable=False, default=1)
    is_overridden = Column(Boolean, nullable=False, default=False)
    overridden_value = Column(Text, nullable=True)

    case = relationship("Case", back_populates="extracted_fields")


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    option_name = Column(String(128), nullable=False)
    structure_type = Column(String(64), nullable=False)
    limit_amount = Column(Float, nullable=False)
    retention_amount = Column(Float, nullable=False)
    ceded_premium = Column(Float, nullable=False)
    rate_on_line = Column(Float, nullable=False)
    commission_rate = Column(Float, nullable=False)
    expected_loss_ratio = Column(Float, nullable=False)
    combined_ratio = Column(Float, nullable=False)
    status = Column(String(32), nullable=False, default="DRAFT")
    is_selected = Column(Boolean, nullable=False, default=False)

    case = relationship("Case", back_populates="quotes")


class StageStatus(Base):
    __tablename__ = "stage_statuses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    stage_key = Column(String(64), nullable=False)
    stage_name = Column(String(128), nullable=False)
    stage_order = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False, default="PENDING")
    agent_name = Column(String(64), nullable=False)
    agent_reasoning = Column(Text, nullable=False, default="")
    confidence_score = Column(Float, nullable=False, default=0.95)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    case = relationship("Case", back_populates="stages")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    stage_key = Column(String(64), nullable=False)
    agent_name = Column(String(64), nullable=False)
    action_type = Column(String(64), nullable=False)
    confidence_score = Column(Float, nullable=True)
    rationale = Column(Text, nullable=False)
    actor_persona = Column(String(64), nullable=False, default="SYSTEM")
    timestamp = Column(DateTime, default=utc_now)

    case = relationship("Case", back_populates="audit_logs")


class BindChecklist(Base):
    __tablename__ = "bind_checklists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(
        String(36), ForeignKey("cases.id"), nullable=False, unique=True, index=True
    )
    sanctions_cleared = Column(Boolean, nullable=False, default=False)
    pricing_hurdle_cleared = Column(Boolean, nullable=False, default=False)
    capacity_approved = Column(Boolean, nullable=False, default=False)
    financial_rating_confirmed = Column(Boolean, nullable=False, default=False)
    wording_approved = Column(Boolean, nullable=False, default=False)
    hitl_signed_off = Column(Boolean, nullable=False, default=False)
    binder_certificate_hash = Column(String(128), nullable=True)
    bound_at = Column(DateTime, nullable=True)
    bound_by = Column(String(64), nullable=True)

    case = relationship("Case", back_populates="bind_checklist")

    @property
    def is_ready_to_bind(self) -> bool:
        return bool(
            self.sanctions_cleared
            and self.pricing_hurdle_cleared
            and self.capacity_approved
            and self.financial_rating_confirmed
            and self.wording_approved
            and self.hitl_signed_off
        )


class PricingScenario(Base):
    __tablename__ = "pricing_scenarios"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False, index=True)
    model_name = Column(String(64), nullable=False)
    technical_premium = Column(Float, nullable=False)
    recommended_rate = Column(Float, nullable=False)
    expected_loss = Column(Float, nullable=False)
    combined_ratio = Column(Float, nullable=False)
    loss_distribution_json = Column(Text, nullable=False, default="[]")

    case = relationship("Case", back_populates="pricing_scenarios")

    @property
    def loss_distribution(self) -> list[dict]:
        if self.loss_distribution_json:
            try:
                return json.loads(self.loss_distribution_json)
            except Exception:
                return []
        return []
