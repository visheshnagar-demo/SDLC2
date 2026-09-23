"""Unit and integration tests for Sales ETL pipeline components."""
import pytest
import pandas as pd
from datetime import datetime
from server.config import Config
from server.pipeline.validator import validate_and_filter
from server.pipeline.transformer import transform_sales_data


@pytest.fixture
def sample_sales_data():
    """Provides sample raw sales data."""
    return pd.DataFrame([
        {
            "order_id": "1001",
            "customer_id": "CUST-201",
            "customer_name": " Alice Johnson ",
            "customer_email": "ALICE.J@EXAMPLE.COM ",
            "product_category": " Electronics ",
            "amount": "299.99",
            "currency": "usd",
            "order_status": "completed",
            "created_at": "2026-09-01T10:14:22Z"
        },
        {
            "order_id": "1002",
            "customer_id": "CUST-202",
            "customer_name": "Bob Smith",
            "customer_email": "bob.smith@example.com",
            "product_category": "Home & Kitchen",
            "amount": "49.50",
            "currency": "USD",
            "order_status": "COMPLETED",
            "created_at": "2026-09-01T11:05:10Z"
        },
        {
            "order_id": "1001",  # Duplicate order_id with updated status & timestamp
            "customer_id": "CUST-201",
            "customer_name": "Alice Johnson",
            "customer_email": "alice.j@example.com",
            "product_category": "Electronics",
            "amount": "299.99",
            "currency": "USD",
            "order_status": "COMPLETED",
            "created_at": "2026-09-01T12:00:00Z"
        }
    ])


@pytest.fixture
def invalid_sales_data():
    """Provides invalid sales data exceeding error threshold."""
    return pd.DataFrame([
        {
            "order_id": None,
            "customer_id": "CUST-999",
            "customer_name": "Invalid Row",
            "customer_email": "invalid@example.com",
            "product_category": "Misc",
            "amount": "invalid_num",
            "currency": "USD",
            "order_status": "PENDING",
            "created_at": None
        }
    ])


def test_config_loader():
    """Verifies environment configuration loading."""
    cfg = Config.load()
    assert cfg.BQ_DATASET == "analytics"
    assert cfg.BQ_TABLE == "daily_sales"
    assert cfg.CIRCUIT_BREAKER_MAX_ERROR_PCT == 15.0


def test_validation_success(sample_sales_data):
    """Verifies that valid rows pass and counts match."""
    valid_df, quarantined_df = validate_and_filter(sample_sales_data, max_error_pct=15.0)
    assert len(valid_df) == 3
    assert len(quarantined_df) == 0


def test_circuit_breaker_triggers_on_high_error_rate(invalid_sales_data):
    """Verifies circuit breaker triggers RuntimeError on bad data."""
    with pytest.raises(RuntimeError) as exc_info:
        validate_and_filter(invalid_sales_data, max_error_pct=15.0)
    assert "Circuit breaker tripped" in str(exc_info.value)


def test_transformation_cleaning_and_deduplication(sample_sales_data):
    """Verifies whitespace trimming, case normalization, deduplication, and derived fields."""
    valid_df, _ = validate_and_filter(sample_sales_data)
    transformed_df = transform_sales_data(valid_df, batch_id="test-batch-uuid")

    # Deduplication check: 3 input rows -> 2 unique order_ids (1001 & 1002)
    assert len(transformed_df) == 2
    assert set(transformed_df["order_id"]) == {"1001", "1002"}

    # Latest record check for 1001
    row_1001 = transformed_df[transformed_df["order_id"] == "1001"].iloc[0]
    assert row_1001["customer_name"] == "Alice Johnson"
    assert row_1001["customer_email"] == "alice.j@example.com"
    assert row_1001["currency"] == "USD"
    assert row_1001["order_status"] == "COMPLETED"
    assert str(row_1001["order_date"]) == "2026-09-01"
    assert row_1001["batch_id"] == "test-batch-uuid"
    assert row_1001["ingested_at"] is not None
