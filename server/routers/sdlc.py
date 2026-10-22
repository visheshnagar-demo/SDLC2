"""REST API endpoints for SDLC Lifecycle Management."""
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    ProjectCreate,
    ProjectResponse,
    ProjectDetailResponse,
    StageSummary,
    RequirementCreate,
    RequirementResponse,
    DesignGenerateResponse,
    DesignApproveRequest,
    DesignApproveResponse,
    DevelopmentSyncRequest,
    DevelopmentSyncResponse,
    TestingExecuteRequest,
    TestingExecuteResponse,
    DeploymentDeployRequest,
    DeploymentDeployResponse,
    AuditLogResponse,
)
from server import crud

router = APIRouter(prefix="/api/v1/sdlc", tags=["SDLC Lifecycle"])


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """Initialize a new SDLC project lifecycle instance."""
    existing = crud.get_project_by_jira_key(db, payload.jira_issue_key)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Project with Jira key {payload.jira_issue_key} already exists.",
        )
    try:
        project = crud.create_project(
            db=db,
            project_name=payload.project_name,
            jira_issue_key=payload.jira_issue_key,
            confluence_space_key=payload.confluence_space_key,
            github_repo=payload.github_repo,
        )
        db.commit()
        db.refresh(project)
        return project
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all SDLC projects with pagination."""
    return crud.list_projects(db, skip=skip, limit=limit)


@router.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Retrieve full project metadata, current stage, and stage completion summary."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    stages_data = crud.compute_stage_summary(db, project)
    stages = [StageSummary(**s) for s in stages_data]

    return ProjectDetailResponse(
        id=project.id,
        project_name=project.project_name,
        jira_issue_key=project.jira_issue_key,
        confluence_space_key=project.confluence_space_key,
        github_repo=project.github_repo,
        current_stage=project.current_stage,
        stage_status=project.stage_status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        stages=stages,
    )


@router.post(
    "/projects/{project_id}/requirements",
    response_model=RequirementResponse,
    status_code=status.HTTP_201_CREATED,
)
def ingest_requirements(
    project_id: str,
    payload: RequirementCreate,
    db: Session = Depends(get_db),
):
    """Ingest, parse, and validate requirement content; transition status to READY_FOR_DESIGN."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    try:
        req = crud.ingest_requirements(
            db=db,
            project=project,
            title=payload.title,
            format_type=payload.format,
            raw_content=payload.raw_content,
            functional_goals=payload.functional_goals,
        )
        db.commit()
        db.refresh(req)

        goals_list = json.loads(req.functional_goals) if req.functional_goals else []
        return RequirementResponse(
            requirement_id=req.id,
            project_id=req.project_id,
            tracking_code=req.tracking_code,
            status=req.status,
            extracted_goals_count=len(goals_list),
            created_at=req.created_at,
        )
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/projects/{project_id}/designs/generate",
    response_model=DesignGenerateResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def generate_design(project_id: str, db: Session = Depends(get_db)):
    """Trigger automated HLD generation based on ingested requirements."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    try:
        design = crud.generate_hld_design(db, project)
        db.commit()
        db.refresh(design)
        return DesignGenerateResponse(
            design_id=design.id,
            status="GENERATION_IN_PROGRESS",
            message="HLD generation initiated",
        )
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/projects/{project_id}/designs/{design_id}/approve",
    response_model=DesignApproveResponse,
)
def approve_design(
    project_id: str,
    design_id: str,
    payload: DesignApproveRequest,
    db: Session = Depends(get_db),
):
    """Approve generated HLD, transition stage to DESIGN_APPROVED, and publish to Confluence."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    try:
        design = crud.approve_design(
            db=db,
            project=project,
            design_id=design_id,
            approved_by=payload.approved_by,
            notes=payload.notes,
        )
        db.commit()
        db.refresh(design)
        return DesignApproveResponse(
            design_id=design.id,
            status=design.status,
            confluence_page_url=design.confluence_url,
            approved_at=design.approved_at,
        )
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/projects/{project_id}/development/sync",
    response_model=DevelopmentSyncResponse,
)
def sync_development(
    project_id: str,
    payload: DevelopmentSyncRequest,
    db: Session = Depends(get_db),
):
    """Synchronize repository branches and commits; update development status."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    try:
        sync = crud.sync_repository(
            db=db,
            project=project,
            branch_name=payload.branch_name,
            target_repo=payload.target_repo,
        )
        db.commit()
        db.refresh(sync)
        return DevelopmentSyncResponse(
            sync_id=sync.id,
            branch_name=sync.branch_name,
            latest_commit_sha=sync.latest_commit_sha,
            commit_count=sync.commit_count,
            status=sync.status,
            synced_at=sync.synced_at,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/projects/{project_id}/testing/execute",
    response_model=TestingExecuteResponse,
)
def execute_testing(
    project_id: str,
    payload: TestingExecuteRequest,
    db: Session = Depends(get_db),
):
    """Trigger automated QA test suites against the staging branch."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    try:
        qa_run = crud.execute_qa_tests(
            db=db,
            project=project,
            suite_type=payload.suite_type,
            timeout_seconds=payload.timeout_seconds or 600,
        )
        db.commit()
        db.refresh(qa_run)
        return TestingExecuteResponse(
            test_run_id=qa_run.id,
            status=qa_run.status,
            total_tests=qa_run.total_tests,
            passed_tests=qa_run.passed_tests,
            failed_tests=qa_run.failed_tests,
            skipped_tests=qa_run.skipped_tests,
            execution_duration_ms=qa_run.duration_ms,
            completed_at=qa_run.created_at,
            report_summary=qa_run.report_summary,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/projects/{project_id}/deployment/deploy",
    response_model=DeploymentDeployResponse,
)
def deploy_environment(
    project_id: str,
    payload: DeploymentDeployRequest,
    db: Session = Depends(get_db),
):
    """Initiate container build and cloud deployment; blocked unless QA is QA_PASSED."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    try:
        deployment = crud.deploy_project(
            db=db,
            project=project,
            environment=payload.environment,
            image_tag=payload.image_tag,
        )
        db.commit()
        db.refresh(deployment)
        return DeploymentDeployResponse(
            deployment_id=deployment.id,
            status=deployment.status,
            environment=deployment.environment,
            service_url=deployment.service_url,
            health_check_status=deployment.health_status,
            health_check_latency_ms=deployment.health_latency_ms,
            deployed_at=deployment.deployed_at,
        )
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/projects/{project_id}/audit-logs",
    response_model=List[AuditLogResponse],
)
def get_audit_logs(project_id: str, db: Session = Depends(get_db)):
    """Retrieve chronological immutable audit records for the project."""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    return crud.get_audit_logs(db, project_id)
