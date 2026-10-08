import uuid
import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_calculate_quote_success(client: TestClient):
    payload = {
        "vehicle_make": "Toyota",
        "vehicle_year": 2022,
        "vehicle_value": 25000.0,
        "driver_age": 30,
        "driving_experience": 5,
        "coverage_type": "Comprehensive"
    }
    response = client.post("/api/v1/quotes/calculate", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["id"] is not None
    assert data["vehicle_make"] == "Toyota"
    assert data["vehicle_year"] == 2022
    assert data["vehicle_value"] == 25000.0
    assert data["driver_age"] == 30
    assert data["driving_experience"] == 5
    assert data["coverage_type"] == "Comprehensive"
    assert data["base_premium"] == 500.0
    assert data["total_premium"] == 1200.0
    assert len(data["breakdown"]) == 5

    # Check that factors list is also present
    assert len(data["factors"]) == 5


def test_quote_retrieval_by_id(client: TestClient):
    payload = {
        "vehicle_make": "Honda",
        "vehicle_year": 2021,
        "vehicle_value": 20000.0,
        "driver_age": 35,
        "driving_experience": 10,
        "coverage_type": "Third Party"
    }
    calc_res = client.post("/api/v1/quotes/calculate", json=payload)
    assert calc_res.status_code == 201
    quote_id = calc_res.json()["id"]

    get_res = client.get(f"/api/v1/quotes/{quote_id}")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data["id"] == quote_id
    assert data["vehicle_make"] == "Honda"
    assert data["total_premium"] > 0


def test_quote_retrieval_not_found(client: TestClient):
    fake_id = str(uuid.uuid4())
    res = client.get(f"/api/v1/quotes/{fake_id}")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_list_quotes_pagination(client: TestClient):
    res = client.get("/api/v1/quotes?skip=0&limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
    assert data["skip"] == 0
    assert data["limit"] == 10


def test_quote_stats(client: TestClient):
    res = client.get("/api/v1/quotes/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_quotes" in data
    assert "quotes_today" in data
    assert "avg_quote_value" in data
    assert "conversion_rate" in data
    assert data["total_quotes"] >= 0


def test_bind_quote(client: TestClient):
    payload = {
        "vehicle_make": "Mazda",
        "vehicle_year": 2023,
        "vehicle_value": 30000.0,
        "driver_age": 28,
        "driving_experience": 6,
        "coverage_type": "Comprehensive"
    }
    calc_res = client.post("/api/v1/quotes/calculate", json=payload)
    quote_id = calc_res.json()["id"]

    bind_res = client.post(f"/api/v1/quotes/{quote_id}/bind")
    assert bind_res.status_code == 200
    assert bind_res.json()["status"] == "Bound"


@pytest.mark.parametrize("invalid_payload,expected_err", [
    # Driver age under 16
    ({
        "vehicle_make": "Toyota",
        "vehicle_year": 2022,
        "vehicle_value": 25000.0,
        "driver_age": 14,
        "driving_experience": 0,
        "coverage_type": "Comprehensive"
    }, "Driver age must be at least 16"),
    # Negative vehicle value
    ({
        "vehicle_make": "Toyota",
        "vehicle_year": 2022,
        "vehicle_value": -5000.0,
        "driver_age": 30,
        "driving_experience": 5,
        "coverage_type": "Comprehensive"
    }, "Vehicle value must be greater than zero"),
    # Driving experience exceeding driver age - 16
    ({
        "vehicle_make": "Toyota",
        "vehicle_year": 2022,
        "vehicle_value": 25000.0,
        "driver_age": 20,
        "driving_experience": 10,
        "coverage_type": "Comprehensive"
    }, "Driving experience"),
    # Manufacture year prior to 1900
    ({
        "vehicle_make": "Ford",
        "vehicle_year": 1850,
        "vehicle_value": 15000.0,
        "driver_age": 30,
        "driving_experience": 5,
        "coverage_type": "Comprehensive"
    }, "prior to 1900"),
    # Manufacture year in the distant future
    ({
        "vehicle_make": "Tesla",
        "vehicle_year": 2099,
        "vehicle_value": 45000.0,
        "driver_age": 30,
        "driving_experience": 5,
        "coverage_type": "Comprehensive"
    }, "future"),
    # Invalid coverage type
    ({
        "vehicle_make": "Toyota",
        "vehicle_year": 2022,
        "vehicle_value": 25000.0,
        "driver_age": 30,
        "driving_experience": 5,
        "coverage_type": "Super Deluxe Nonexistent"
    }, "Invalid coverage type"),
    # Empty vehicle make
    ({
        "vehicle_make": "   ",
        "vehicle_year": 2022,
        "vehicle_value": 25000.0,
        "driver_age": 30,
        "driving_experience": 5,
        "coverage_type": "Comprehensive"
    }, "Vehicle make must not be empty"),
])
def test_validation_errors(client: TestClient, invalid_payload, expected_err):
    response = client.post("/api/v1/quotes/calculate", json=invalid_payload)
    assert response.status_code == 422
    assert expected_err.lower() in response.text.lower()
