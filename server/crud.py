"""CRUD and business logic operations for the SDLC platform."""
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from server.models import (
    Project,
    Requirement,
    Design,
    RepoSync,
    QaRun,
    Deployment,
    AuditLog,
)


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def compute_content_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def get_project_by_id(db: Session, project_id: str) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_by_jira_key(db: Session, jira_issue_key: str) -> Optional[Project]:
    return db.query(Project).filter(Project.jira_issue_key == jira_issue_key).first()


def list_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
    return db.query(Project).order_by(Project.created_at.desc()).offset(skip).limit(limit).all()


def create_project(
    db: Session,
    project_name: str,
    jira_issue_key: str,
    confluence_space_key: str,
    github_repo: str,
) -> Project:
    project = Project(
        project_name=project_name,
        jira_issue_key=jira_issue_key,
        confluence_space_key=confluence_space_key,
        github_repo=github_repo,
        current_stage="REQUIREMENTS",
        stage_status="CREATED",
    )
    db.add(project)
    db.flush()

    audit = AuditLog(
        project_id=project.id,
        stage="REQUIREMENTS",
        action="PROJECT_CREATED",
        actor="system",
        details=f"Project '{project_name}' created with Jira key {jira_issue_key}",
    )
    db.add(audit)
    return project


def ingest_requirements(
    db: Session,
    project: Project,
    title: str,
    format_type: str,
    raw_content: str,
    functional_goals: Optional[List[str]] = None,
) -> Requirement:
    # Validate format
    upper_format = format_type.upper()
    if upper_format not in ["MARKDOWN", "TEXT", "JSON"]:
        raise ValueError("Unsupported format. Must be MARKDOWN, TEXT, or JSON.")

    if not raw_content.strip():
        raise ValueError("Requirement content cannot be empty.")

    content_hash = compute_content_hash(raw_content)

    # Invalidate existing designs if requirements modified
    existing_designs = db.query(Design).filter(Design.project_id == project.id).all()
    for design in existing_designs:
        design.status = "STALE"

    # Count requirements for tracking code
    req_count = db.query(Requirement).filter(Requirement.project_id == project.id).count()
    tracking_code = f"REQ-{project.jira_issue_key}-{req_count + 1:02d}"

    goals = functional_goals or []
    if not goals and upper_format == "MARKDOWN":
        # Extract lines starting with bullet points or numbers
        extracted = []
        for line in raw_content.splitlines():
            stripped = line.strip()
            if stripped.startswith("- ") or stripped.startswith("* "):
                extracted.append(stripped[2:].strip())
        if extracted:
            goals = extracted

    requirement = Requirement(
        project_id=project.id,
        tracking_code=tracking_code,
        title=title,
        format=upper_format,
        raw_content=raw_content,
        content_hash=content_hash,
        functional_goals=json.dumps(goals),
        status="READY_FOR_DESIGN",
    )
    db.add(requirement)

    # Update project state
    project.current_stage = "REQUIREMENTS"
    project.stage_status = "READY_FOR_DESIGN"
    project.updated_at = get_utc_now()

    audit = AuditLog(
        project_id=project.id,
        stage="REQUIREMENTS",
        action="REQUIREMENTS_INGESTED",
        actor="user@company.com",
        details=f"Uploaded requirements '{title}' with {len(goals)} functional goals",
    )
    db.add(audit)

    return requirement


def generate_hld_design(db: Session, project: Project) -> Design:
    latest_req = (
        db.query(Requirement)
        .filter(Requirement.project_id == project.id)
        .order_by(Requirement.created_at.desc())
        .first()
    )
    if not latest_req:
        raise ValueError("Cannot generate design without ingested requirements.")

    hld_title = f"{project.jira_issue_key}: High-Level Design (HLD) - {project.project_name}"
    hld_content = (
        f"# High-Level Design (HLD): {project.project_name}\n\n"
        f"**Jira Issue:** {project.jira_issue_key}\n"
        f"**Confluence Space:** {project.confluence_space_key}\n\n"
        f"## 1. System Overview\nAutomated SDLC lifecycle architecture for {project.project_name}.\n\n"
        f"## 2. API Contracts & Architecture\nRESTful endpoints with Spring Boot and React integration."
    )

    design = Design(
        project_id=project.id,
        requirement_id=latest_req.id,
        hld_title=hld_title,
        hld_content=hld_content,
        status="PENDING_APPROVAL",
    )
    db.add(design)

    project.current_stage = "DESIGN"
    project.stage_status = "GENERATION_IN_PROGRESS"
    project.updated_at = get_utc_now()

    audit = AuditLog(
        project_id=project.id,
        stage="DESIGN",
        action="DESIGN_GENERATED",
        actor="system",
        details=f"HLD design generated for requirement {latest_req.tracking_code}",
    )
    db.add(audit)

    return design


def approve_design(
    db: Session,
    project: Project,
    design_id: str,
    approved_by: str,
    notes: Optional[str] = None,
) -> Design:
    design = (
        db.query(Design)
        .filter(Design.id == design_id, Design.project_id == project.id)
        .first()
    )
    if not design:
        raise ValueError("Design not found.")

    design.status = "DESIGN_APPROVED"
    design.approved_by = approved_by
    design.approved_at = get_utc_now()
    design.confluence_url = (
        f"https://bfsi-na-ai-engineering-v4.atlassian.net/wiki/spaces/{project.confluence_space_key}/pages/93683713/{project.jira_issue_key}"
    )

    project.current_stage = "DESIGN"
    project.stage_status = "DESIGN_APPROVED"
    project.updated_at = get_utc_now()

    audit = AuditLog(
        project_id=project.id,
        stage="DESIGN",
        action="DESIGN_APPROVED",
        actor=approved_by,
        details=notes or f"HLD approved and published to Confluence ({design.confluence_url})",
    )
    db.add(audit)

    return design


def sync_repository(
    db: Session,
    project: Project,
    branch_name: str,
    target_repo: Optional[str] = None,
) -> RepoSync:
    latest_commit_sha = "a1b2c3d4e5f67890123456789abcdef012345678"
    commit_count = 8

    repo_sync = RepoSync(
        project_id=project.id,
        branch_name=branch_name,
        latest_commit_sha=latest_commit_sha,
        commit_count=commit_count,
        status="DEVELOPMENT_COMPLETED",
    )
    db.add(repo_sync)

    project.current_stage = "DEVELOPMENT"
    project.stage_status = "DEVELOPMENT_COMPLETED"
    project.updated_at = get_utc_now()

    audit = AuditLog(
        project_id=project.id,
        stage="DEVELOPMENT",
        action="DEVELOPMENT_SYNCED",
        actor="system",
        details=f"Synchronized branch '{branch_name}' with {commit_count} commits (SHA: {latest_commit_sha[:8]})",
    )
    db.add(audit)

    return repo_sync


def execute_qa_tests(
    db: Session,
    project: Project,
    suite_type: str = "ALL",
    timeout_seconds: int = 600,
) -> QaRun:
    is_timeout = timeout_seconds <= 0 or suite_type.upper() == "TIMEOUT"
    is_failed = suite_type.upper() == "FAIL"

    if is_timeout:
        status = "TEST_TIMEOUT"
        total = 32
        passed = 10
        failed = 22
        duration_ms = 600000
        summary = "Test run exceeded timeout threshold and was terminated."
        err = "TimeoutError: Suite execution exceeded timeout limit."
    elif is_failed:
        status = "QA_FAILED"
        total = 32
        passed = 28
        failed = 4
        duration_ms = 15200
        summary = "4 integration tests failed with assertion errors."
        err = "AssertionError: Expected HTTP 200 but received HTTP 500"
    else:
        status = "QA_PASSED"
        total = 32
        passed = 32
        failed = 0
        duration_ms = 28450
        summary = "All unit, integration, and contract tests passed successfully."
        err = None

    qa_run = QaRun(
        project_id=project.id,
        suite_type=suite_type,
        total_tests=total,
        passed_tests=passed,
        failed_tests=failed,
        skipped_tests=0,
        duration_ms=duration_ms,
        status=status,
        error_details=err,
        report_summary=summary,
    )
    db.add(qa_run)

    project.current_stage = "TESTING"
    project.stage_status = status
    project.updated_at = get_utc_now()

    audit = AuditLog(
        project_id=project.id,
        stage="TESTING",
        action=f"QA_EXECUTION_{status}",
        actor="qa-agent@sdlc.local",
        details=f"Executed {total} tests in {duration_ms}ms with status {status}",
    )
    db.add(audit)

    return qa_run


def deploy_project(
    db: Session,
    project: Project,
    environment: str = "STAGING",
    image_tag: str = "v1.0.0-SCRUM-462",
) -> Deployment:
    # Check if QA passed
    latest_qa = (
        db.query(QaRun)
        .filter(QaRun.project_id == project.id)
        .order_by(QaRun.created_at.desc())
        .first()
    )
    if not latest_qa or latest_qa.status != "QA_PASSED":
        raise ValueError("Deployment cannot be initiated while QA status is not QA_PASSED.")

    service_url = f"https://sdlc2-{environment.lower()}-upbeat-repeater.a.run.app"
    deployment = Deployment(
        project_id=project.id,
        environment=environment,
        image_tag=image_tag,
        service_url=service_url,
        health_status="UP",
        health_latency_ms=45,
        deployment_logs="Container build succeeded. Image deployed to Cloud Run. Health check UP.",
        status="DEPLOYED_SUCCESS",
    )
    db.add(deployment)

    project.current_stage = "DEPLOYMENT"
    project.stage_status = "DEPLOYED_SUCCESS"
    project.updated_at = get_utc_now()

    audit = AuditLog(
        project_id=project.id,
        stage="DEPLOYMENT",
        action="DEPLOYMENT_SUCCESS",
        actor="devops-agent@sdlc.local",
        details=f"Successfully deployed image {image_tag} to {environment} at {service_url}",
    )
    db.add(audit)

    return deployment


def get_audit_logs(db: Session, project_id: str) -> List[AuditLog]:
    return (
        db.query(AuditLog)
        .filter(AuditLog.project_id == project_id)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )


def compute_stage_summary(db: Session, project: Project) -> List[dict]:
    stages_order = ["REQUIREMENTS", "DESIGN", "DEVELOPMENT", "TESTING", "DEPLOYMENT"]
    stage_indexes = {s: i for i, s in enumerate(stages_order)}
    curr_idx = stage_indexes.get(project.current_stage, 0)

    # Fetch latest timestamps per stage
    latest_req = (
        db.query(Requirement)
        .filter(Requirement.project_id == project.id)
        .order_by(Requirement.updated_at.desc())
        .first()
    )
    latest_design = (
        db.query(Design)
        .filter(Design.project_id == project.id)
        .order_by(Design.updated_at.desc())
        .first()
    )
    latest_sync = (
        db.query(RepoSync)
        .filter(RepoSync.project_id == project.id)
        .order_by(RepoSync.synced_at.desc())
        .first()
    )
    latest_qa = (
        db.query(QaRun)
        .filter(QaRun.project_id == project.id)
        .order_by(QaRun.created_at.desc())
        .first()
    )
    latest_dep = (
        db.query(Deployment)
        .filter(Deployment.project_id == project.id)
        .order_by(Deployment.deployed_at.desc())
        .first()
    )

    timestamps = {
        "REQUIREMENTS": latest_req.updated_at if latest_req else project.created_at,
        "DESIGN": latest_design.updated_at if latest_design else None,
        "DEVELOPMENT": latest_sync.synced_at if latest_sync else None,
        "TESTING": latest_qa.created_at if latest_qa else None,
        "DEPLOYMENT": latest_dep.deployed_at if latest_dep else None,
    }

    result = []
    for i, stg in enumerate(stages_order):
        if i < curr_idx:
            status = "COMPLETED"
        elif i == curr_idx:
            if project.stage_status in ["CREATED", "REQUIREMENTS_INGESTED", "GENERATION_IN_PROGRESS", "QA_IN_PROGRESS", "DEPLOYMENT_IN_PROGRESS"]:
                status = "IN_PROGRESS"
            elif project.stage_status in ["QA_FAILED", "TEST_TIMEOUT", "DEPLOYMENT_FAILED"]:
                status = project.stage_status
            elif project.stage_status in ["DEPLOYED_SUCCESS", "QA_PASSED", "DESIGN_APPROVED", "DEVELOPMENT_COMPLETED"]:
                status = "COMPLETED"
            else:
                status = "IN_PROGRESS"
        else:
            status = "PENDING"

        result.append({
            "stage": stg,
            "status": status,
            "updated_at": timestamps.get(stg),
        })

    return result
