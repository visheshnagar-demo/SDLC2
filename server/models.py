"""SQLAlchemy models for the SDLC Lifecycle Management Platform."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "sdlc_projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_name = Column(String(255), nullable=False)
    jira_issue_key = Column(String(50), nullable=False, unique=True, index=True)
    confluence_space_key = Column(String(50), nullable=False)
    github_repo = Column(String(255), nullable=False)
    current_stage = Column(String(50), nullable=False, default="REQUIREMENTS")
    stage_status = Column(String(50), nullable=False, default="CREATED")
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")
    designs = relationship("Design", back_populates="project", cascade="all, delete-orphan")
    repo_syncs = relationship("RepoSync", back_populates="project", cascade="all, delete-orphan")
    qa_runs = relationship("QaRun", back_populates="project", cascade="all, delete-orphan")
    deployments = relationship("Deployment", back_populates="project", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="project", cascade="all, delete-orphan")


class Requirement(Base):
    __tablename__ = "sdlc_requirements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("sdlc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    tracking_code = Column(String(100), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    format = Column(String(20), nullable=False, default="MARKDOWN")
    raw_content = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False)
    functional_goals = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="READY_FOR_DESIGN")
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="requirements")
    designs = relationship("Design", back_populates="requirement", cascade="all, delete-orphan")


class Design(Base):
    __tablename__ = "sdlc_designs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("sdlc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_id = Column(String(36), ForeignKey("sdlc_requirements.id", ondelete="CASCADE"), nullable=False)
    hld_title = Column(String(255), nullable=False)
    hld_content = Column(Text, nullable=False)
    confluence_url = Column(String(512), nullable=True)
    status = Column(String(50), nullable=False, default="PENDING_APPROVAL")
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="designs")
    requirement = relationship("Requirement", back_populates="designs")


class RepoSync(Base):
    __tablename__ = "sdlc_repo_syncs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("sdlc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_name = Column(String(255), nullable=False)
    latest_commit_sha = Column(String(64), nullable=False)
    commit_count = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="DEVELOPMENT_COMPLETED")
    diagnostics = Column(Text, nullable=True)
    synced_at = Column(DateTime, default=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="repo_syncs")


class QaRun(Base):
    __tablename__ = "sdlc_qa_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("sdlc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    suite_type = Column(String(50), nullable=False, default="ALL")
    total_tests = Column(Integer, nullable=False, default=0)
    passed_tests = Column(Integer, nullable=False, default=0)
    failed_tests = Column(Integer, nullable=False, default=0)
    skipped_tests = Column(Integer, nullable=False, default=0)
    duration_ms = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="QA_PASSED")
    error_details = Column(Text, nullable=True)
    report_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="qa_runs")


class Deployment(Base):
    __tablename__ = "sdlc_deployments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("sdlc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    environment = Column(String(50), nullable=False, default="STAGING")
    image_tag = Column(String(100), nullable=False)
    service_url = Column(String(512), nullable=True)
    health_status = Column(String(50), nullable=False, default="UP")
    health_latency_ms = Column(Integer, nullable=True)
    deployment_logs = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="DEPLOYED_SUCCESS")
    deployed_at = Column(DateTime, default=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="deployments")


class AuditLog(Base):
    __tablename__ = "sdlc_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("sdlc_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    actor = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=get_utc_now, nullable=False)

    project = relationship("Project", back_populates="audit_logs")
