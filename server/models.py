import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from server.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    storage_path = Column(String(500), nullable=False)
    status = Column(String(50), nullable=False, default="PENDING_INGESTION")
    extracted_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    analysis_jobs = relationship(
        "AnalysisJob", back_populates="document", cascade="all, delete-orphan"
    )
    decisions = relationship(
        "UnderwritingDecision", back_populates="document", cascade="all, delete-orphan"
    )


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    status = Column(String(50), nullable=False, default="QUEUED")
    composite_risk_score = Column(Float, nullable=True)
    risk_tier = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    document = relationship("Document", back_populates="analysis_jobs")
    clause_evaluations = relationship(
        "ClauseEvaluation", back_populates="analysis_job", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AgentAuditLog", back_populates="analysis_job", cascade="all, delete-orphan"
    )


class ClauseEvaluation(Base):
    __tablename__ = "clause_evaluations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_job_id = Column(String(36), ForeignKey("analysis_jobs.id"), nullable=False)
    clause_title = Column(String(255), nullable=False)
    clause_text = Column(Text, nullable=False)
    is_standard = Column(Boolean, nullable=False, default=True)
    risk_severity = Column(String(50), nullable=False, default="LOW")
    deviation_analysis = Column(Text, nullable=True)
    recommended_action = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    analysis_job = relationship("AnalysisJob", back_populates="clause_evaluations")


class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    decision = Column(String(50), nullable=False)
    underwriter_id = Column(String(100), nullable=False)
    reviewer_notes = Column(Text, nullable=False)
    subjectivities = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    document = relationship("Document", back_populates="decisions")


class AgentAuditLog(Base):
    __tablename__ = "agent_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_job_id = Column(String(36), ForeignKey("analysis_jobs.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    step_name = Column(String(100), nullable=False)
    execution_status = Column(String(50), nullable=False)
    execution_time_ms = Column(Integer, nullable=False, default=0)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    analysis_job = relationship("AnalysisJob", back_populates="audit_logs")
