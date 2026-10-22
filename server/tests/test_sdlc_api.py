"""Comprehensive test suite for SDLC Lifecycle Management Platform API."""
import pytest


def test_health_check_endpoints(client):
    """Test health check endpoints."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "UP"

    res_api = client.get("/api/v1/health")
    assert res_api.status_code == 200
    assert res_api.json()["status"] == "UP"

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "platform" in res_root.json()


def test_create_and_get_project(client):
    """AC: Project initialization and retrieval."""
    payload = {
        "project_name": "SDLC Platform Core",
        "jira_issue_key": "SCRUM-462",
        "confluence_space_key": "SCRUM2",
        "github_repo": "visheshnagar-demo/SDLC2",
    }
    response = client.post("/api/v1/sdlc/projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["jira_issue_key"] == "SCRUM-462"
    assert data["current_stage"] == "REQUIREMENTS"
    assert data["stage_status"] == "CREATED"
    project_id = data["id"]

    # Duplicate project key rejection
    dup_res = client.post("/api/v1/sdlc/projects", json=payload)
    assert dup_res.status_code == 400

    # Get project by ID
    get_res = client.get(f"/api/v1/sdlc/projects/{project_id}")
    assert get_res.status_code == 200
    detail = get_res.json()
    assert detail["id"] == project_id
    assert len(detail["stages"]) == 5
    assert detail["stages"][0]["stage"] == "REQUIREMENTS"

    # List projects
    list_res = client.get("/api/v1/sdlc/projects")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_requirement_ingestion_success_and_validation(client):
    """AC: Requirement Ingestion & Structured Parsing with validation and READY_FOR_DESIGN transition."""
    # Create project
    proj_res = client.post(
        "/api/v1/sdlc/projects",
        json={
            "project_name": "Test Platform",
            "jira_issue_key": "SCRUM-101",
            "confluence_space_key": "SCRUM2",
            "github_repo": "visheshnagar-demo/SDLC2",
        },
    )
    project_id = proj_res.json()["id"]

    # Ingest valid requirement
    req_payload = {
        "title": "Core Requirement Spec",
        "format": "MARKDOWN",
        "raw_content": "# Feature Spec\n\n- User Authentication\n- Project Dashboard\n- Test Automation",
        "functional_goals": ["User Authentication", "Project Dashboard", "Test Automation"],
    }
    req_res = client.post(f"/api/v1/sdlc/projects/{project_id}/requirements", json=req_payload)
    assert req_res.status_code == 201
    req_data = req_res.json()
    assert req_data["project_id"] == project_id
    assert req_data["tracking_code"] == "REQ-SCRUM-101-01"
    assert req_data["status"] == "READY_FOR_DESIGN"
    assert req_data["extracted_goals_count"] == 3

    # Check project state transition
    p_res = client.get(f"/api/v1/sdlc/projects/{project_id}")
    assert p_res.json()["stage_status"] == "READY_FOR_DESIGN"

    # Empty raw_content error handling (edge case)
    empty_res = client.post(
        f"/api/v1/sdlc/projects/{project_id}/requirements",
        json={"title": "Empty", "format": "MARKDOWN", "raw_content": "   "},
    )
    assert empty_res.status_code == 400

    # Unsupported format error handling (edge case)
    invalid_format_res = client.post(
        f"/api/v1/sdlc/projects/{project_id}/requirements",
        json={"title": "Invalid", "format": "XML", "raw_content": "some content"},
    )
    assert invalid_format_res.status_code == 400


def test_design_generation_and_approval(client):
    """AC: Architecture & Design Document Generation with review/approval workflow."""
    # Create project and requirement
    p_res = client.post(
        "/api/v1/sdlc/projects",
        json={
            "project_name": "Design Test",
            "jira_issue_key": "SCRUM-102",
            "confluence_space_key": "SCRUM2",
            "github_repo": "visheshnagar-demo/SDLC2",
        },
    )
    project_id = p_res.json()["id"]

    # Generate design without requirements should fail
    fail_gen = client.post(f"/api/v1/sdlc/projects/{project_id}/designs/generate")
    assert fail_gen.status_code == 400

    # Ingest requirement
    client.post(
        f"/api/v1/sdlc/projects/{project_id}/requirements",
        json={
            "title": "Design Spec",
            "format": "MARKDOWN",
            "raw_content": "# Goals\n- Feature A\n- Feature B",
        },
    )

    # Generate design
    gen_res = client.post(f"/api/v1/sdlc/projects/{project_id}/designs/generate")
    assert gen_res.status_code == 202
    design_id = gen_res.json()["design_id"]

    # Approve design
    appr_payload = {
        "approved_by": "lead.architect@company.com",
        "notes": "HLD approved for implementation.",
    }
    appr_res = client.post(
        f"/api/v1/sdlc/projects/{project_id}/designs/{design_id}/approve",
        json=appr_payload,
    )
    assert appr_res.status_code == 200
    appr_data = appr_res.json()
    assert appr_data["status"] == "DESIGN_APPROVED"
    assert "confluence_page_url" in appr_data

    # Check project state
    p_res = client.get(f"/api/v1/sdlc/projects/{project_id}")
    assert p_res.json()["stage_status"] == "DESIGN_APPROVED"


def test_code_development_and_repo_sync(client):
    """AC: Code Development & Repository Synchronization tracking commits on staging branch."""
    p_res = client.post(
        "/api/v1/sdlc/projects",
        json={
            "project_name": "Dev Sync Test",
            "jira_issue_key": "SCRUM-103",
            "confluence_space_key": "SCRUM2",
            "github_repo": "visheshnagar-demo/SDLC2",
        },
    )
    project_id = p_res.json()["id"]

    sync_payload = {
        "branch_name": "staging/ISSUE-SCRUM-103",
        "target_repo": "visheshnagar-demo/SDLC2",
    }
    sync_res = client.post(
        f"/api/v1/sdlc/projects/{project_id}/development/sync",
        json=sync_payload,
    )
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["status"] == "DEVELOPMENT_COMPLETED"
    assert sync_data["branch_name"] == "staging/ISSUE-SCRUM-103"
    assert sync_data["commit_count"] == 8

    p_res = client.get(f"/api/v1/sdlc/projects/{project_id}")
    assert p_res.json()["stage_status"] == "DEVELOPMENT_COMPLETED"


def test_qa_testing_execution_and_timeout(client):
    """AC: Automated Test Suite Execution & QA Dashboard metrics and status."""
    p_res = client.post(
        "/api/v1/sdlc/projects",
        json={
            "project_name": "QA Test",
            "jira_issue_key": "SCRUM-104",
            "confluence_space_key": "SCRUM2",
            "github_repo": "visheshnagar-demo/SDLC2",
        },
    )
    project_id = p_res.json()["id"]

    # Successful test execution
    qa_res = client.post(
        f"/api/v1/sdlc/projects/{project_id}/testing/execute",
        json={"suite_type": "ALL", "timeout_seconds": 600},
    )
    assert qa_res.status_code == 200
    qa_data = qa_res.json()
    assert qa_data["status"] == "QA_PASSED"
    assert qa_data["passed_tests"] == 32
    assert qa_data["failed_tests"] == 0

    # Failed test execution (edge case)
    fail_qa = client.post(
        f"/api/v1/sdlc/projects/{project_id}/testing/execute",
        json={"suite_type": "FAIL", "timeout_seconds": 600},
    )
    assert fail_qa.status_code == 200
    assert fail_qa.json()["status"] == "QA_FAILED"

    # Timeout test execution (edge case)
    timeout_qa = client.post(
        f"/api/v1/sdlc/projects/{project_id}/testing/execute",
        json={"suite_type": "TIMEOUT", "timeout_seconds": 0},
    )
    assert timeout_qa.status_code == 200
    assert timeout_qa.json()["status"] == "TEST_TIMEOUT"


def test_deployment_automation_and_governance(client):
    """AC: Deployment Automation & Environment Health Monitoring."""
    p_res = client.post(
        "/api/v1/sdlc/projects",
        json={
            "project_name": "Deploy Test",
            "jira_issue_key": "SCRUM-105",
            "confluence_space_key": "SCRUM2",
            "github_repo": "visheshnagar-demo/SDLC2",
        },
    )
    project_id = p_res.json()["id"]

    # Attempt deploy before QA passed -> should be rejected with 400
    dep_fail = client.post(
        f"/api/v1/sdlc/projects/{project_id}/deployment/deploy",
        json={"environment": "STAGING", "image_tag": "v1.0.0-SCRUM-105"},
    )
    assert dep_fail.status_code == 400

    # Run QA and pass
    client.post(
        f"/api/v1/sdlc/projects/{project_id}/testing/execute",
        json={"suite_type": "ALL", "timeout_seconds": 600},
    )

    # Now deploy should succeed
    dep_res = client.post(
        f"/api/v1/sdlc/projects/{project_id}/deployment/deploy",
        json={"environment": "STAGING", "image_tag": "v1.0.0-SCRUM-105"},
    )
    assert dep_res.status_code == 200
    dep_data = dep_res.json()
    assert dep_data["status"] == "DEPLOYED_SUCCESS"
    assert dep_data["health_check_status"] == "UP"
    assert "service_url" in dep_data

    # Check project state
    p_res = client.get(f"/api/v1/sdlc/projects/{project_id}")
    assert p_res.json()["stage_status"] == "DEPLOYED_SUCCESS"


def test_audit_logs_retrieval(client):
    """AC: Unified Lifecycle Stepper & Audit Overview Dashboard audit records."""
    p_res = client.post(
        "/api/v1/sdlc/projects",
        json={
            "project_name": "Audit Test",
            "jira_issue_key": "SCRUM-106",
            "confluence_space_key": "SCRUM2",
            "github_repo": "visheshnagar-demo/SDLC2",
        },
    )
    project_id = p_res.json()["id"]

    client.post(
        f"/api/v1/sdlc/projects/{project_id}/requirements",
        json={
            "title": "Audit Req",
            "format": "MARKDOWN",
            "raw_content": "# Goal\n- Log auditing",
        },
    )

    audit_res = client.get(f"/api/v1/sdlc/projects/{project_id}/audit-logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 2
    actions = [l["action"] for l in logs]
    assert "PROJECT_CREATED" in actions
    assert "REQUIREMENTS_INGESTED" in actions
