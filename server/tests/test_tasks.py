import uuid
from fastapi.testclient import TestClient


def test_get_tasks_empty(client: TestClient):
    response = client.get("/api/v1/tasks")
    assert response.status_code == 200
    assert response.json() == []


def test_create_task_success(client: TestClient):
    payload = {"title": "Buy groceries"}
    response = client.post("/api/v1/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "Buy groceries"
    assert data["completed"] is False
    assert "created_at" in data
    assert "updated_at" in data
    assert "createdAt" in data
    assert "updatedAt" in data


def test_create_task_validation_empty_whitespace(client: TestClient):
    response1 = client.post("/api/v1/tasks", json={"title": ""})
    assert response1.status_code == 422

    response2 = client.post("/api/v1/tasks", json={"title": "   "})
    assert response2.status_code == 422


def test_create_task_validation_max_length(client: TestClient):
    long_title = "a" * 256
    response = client.post("/api/v1/tasks", json={"title": long_title})
    assert response.status_code == 422


def test_get_task_by_id(client: TestClient):
    create_resp = client.post("/api/v1/tasks", json={"title": "Specific Task"})
    task_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/v1/tasks/{task_id}")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["id"] == task_id
    assert data["title"] == "Specific Task"
    assert data["completed"] is False


def test_get_task_not_found(client: TestClient):
    random_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/tasks/{random_id}")
    assert response.status_code == 404


def test_toggle_task_completion(client: TestClient):
    create_resp = client.post("/api/v1/tasks", json={"title": "Finish report"})
    task_id = create_resp.json()["id"]

    # Toggle to completed = True
    patch_resp = client.patch(f"/api/v1/tasks/{task_id}", json={"completed": True})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["completed"] is True

    # Toggle back to completed = False
    patch_resp2 = client.patch(f"/api/v1/tasks/{task_id}", json={"completed": False})
    assert patch_resp2.status_code == 200
    assert patch_resp2.json()["completed"] is False


def test_update_task_title(client: TestClient):
    create_resp = client.post("/api/v1/tasks", json={"title": "Old Title"})
    task_id = create_resp.json()["id"]

    put_resp = client.put(f"/api/v1/tasks/{task_id}", json={"title": "New Title"})
    assert put_resp.status_code == 200
    assert put_resp.json()["title"] == "New Title"


def test_update_task_not_found(client: TestClient):
    random_id = str(uuid.uuid4())
    response = client.patch(f"/api/v1/tasks/{random_id}", json={"completed": True})
    assert response.status_code == 404


def test_delete_task_success(client: TestClient):
    create_resp = client.post("/api/v1/tasks", json={"title": "Task to delete"})
    task_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/tasks/{task_id}")
    assert del_resp.status_code == 204

    # Verify task no longer exists
    get_resp = client.get(f"/api/v1/tasks/{task_id}")
    assert get_resp.status_code == 404


def test_delete_task_not_found(client: TestClient):
    random_id = str(uuid.uuid4())
    response = client.delete(f"/api/v1/tasks/{random_id}")
    assert response.status_code == 404


def test_filter_and_search_tasks(client: TestClient):
    client.post("/api/v1/tasks", json={"title": "Alpha task"})
    task2 = client.post("/api/v1/tasks", json={"title": "Beta task"}).json()
    client.patch(f"/api/v1/tasks/{task2['id']}", json={"completed": True})

    # Filter completed=True
    resp_completed = client.get("/api/v1/tasks?completed=true")
    assert resp_completed.status_code == 200
    items = resp_completed.json()
    assert len(items) == 1
    assert items[0]["title"] == "Beta task"

    # Filter completed=False
    resp_pending = client.get("/api/v1/tasks?completed=false")
    assert resp_pending.status_code == 200
    items_pending = resp_pending.json()
    assert len(items_pending) == 1
    assert items_pending[0]["title"] == "Alpha task"

    # Search query
    resp_search = client.get("/api/v1/tasks?search=alpha")
    assert resp_search.status_code == 200
    items_search = resp_search.json()
    assert len(items_search) == 1
    assert items_search[0]["title"] == "Alpha task"
