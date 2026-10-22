"""Pydantic schemas for request and response models."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class StageSummary(BaseModel):
    stage: str
    status: str
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectCreate(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    jira_issue_key: str = Field(..., min_length=1, max_length=50)
    confluence_space_key: str = Field(..., min_length=1, max_length=50)
    github_repo: str = Field(..., min_length=1, max_length=255)


class ProjectResponse(BaseModel):
    id: str
    project_name: str
    jira_issue_key: str
    confluence_space_key: str
    github_repo: str
    current_stage: str
    stage_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailResponse(BaseModel):
    id: str
    project_name: str
    jira_issue_key: str
    confluence_space_key: str
    github_repo: str
    current_stage: str
    stage_status: str
    created_at: datetime
    updated_at: datetime
    stages: List[StageSummary]

    model_config = ConfigDict(from_attributes=True)


class RequirementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    format: str = Field(default="MARKDOWN")
    raw_content: str = Field(..., min_length=1)
    functional_goals: Optional[List[str]] = None


class RequirementResponse(BaseModel):
    requirement_id: str
    project_id: str
    tracking_code: str
    status: str
    extracted_goals_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DesignGenerateResponse(BaseModel):
    design_id: str
    status: str
    message: str

    model_config = ConfigDict(from_attributes=True)


class DesignApproveRequest(BaseModel):
    approved_by: str = Field(..., min_length=1, max_length=255)
    notes: Optional[str] = None


class DesignApproveResponse(BaseModel):
    design_id: str
    status: str
    confluence_page_url: Optional[str] = None
    approved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DevelopmentSyncRequest(BaseModel):
    branch_name: str = Field(..., min_length=1, max_length=255)
    target_repo: Optional[str] = None


class DevelopmentSyncResponse(BaseModel):
    sync_id: str
    branch_name: str
    latest_commit_sha: str
    commit_count: int
    status: str
    synced_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TestingExecuteRequest(BaseModel):
    suite_type: str = Field(default="ALL")
    timeout_seconds: Optional[int] = Field(default=600)


class TestingExecuteResponse(BaseModel):
    test_run_id: str
    status: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    skipped_tests: int
    execution_duration_ms: int
    completed_at: datetime
    report_summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DeploymentDeployRequest(BaseModel):
    environment: str = Field(default="STAGING")
    image_tag: str = Field(default="v1.0.0-SCRUM-462")


class DeploymentDeployResponse(BaseModel):
    deployment_id: str
    status: str
    environment: str
    service_url: Optional[str] = None
    health_check_status: str
    health_check_latency_ms: Optional[int] = None
    deployed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogResponse(BaseModel):
    id: str
    stage: str
    action: str
    actor: str
    details: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    timestamp: datetime
    status: int
    error: str
    message: str
    path: str
