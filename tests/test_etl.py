"""Unit and Integration Tests for Sales Order ETL Pipeline."""
import ast
import json
import os
import pytest
from datetime import datetime, date

try:
    import pandas as pd
except ImportError:
    pd = None


def test_schema_json_conformance():
    """Verifies that schemas/daily_sales_schema.json has valid structure."""
    schema_path = os.path.join("schemas", "daily_sales_schema.json")
    assert os.path.isfile(schema_path), f"Missing schema file: {schema_path}"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    field_names = [field["name"] for field in schema]
    assert "order_id" in field_names
    assert "order_date" in field_names
    assert "customer_id" in field_names
    assert "amount" in field_names
    assert "ingested_at" in field_names


def test_transformation_spec_conformance():
    """Verifies that transformation_spec.json contains all required metadata and source/target/transformations structure."""
    spec_path = "transformation_spec.json"
    assert os.path.isfile(spec_path), f"Missing transformation spec: {spec_path}"
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    # Check top-level source/target/transformations structure
    assert "source" in spec, "transformation_spec.json must contain 'source' section"
    assert "target" in spec, "transformation_spec.json must contain 'target' section"
    assert "transformations" in spec, "transformation_spec.json must contain 'transformations' list"

    assert spec["source"].get("type") == "gcs"
    assert spec["target"].get("type") == "bigquery"
    assert len(spec["transformations"]) > 0

    assert spec.get("target_table") == "analytics.daily_sales"
    assert spec.get("partition_field") == "order_date"
    columns = spec.get("columns", [])
    assert len(columns) > 0
    source_names = [c["source_name"] for c in columns]
    assert "order_id" in source_names
    assert "amount" in source_names
    assert "created_at" in source_names


def test_env_deploy_json_conformance():
    """Verifies that env.deploy.json contains failure_behavior, cpu/memory, and resources configuration."""
    deploy_path = "env.deploy.json"
    assert os.path.isfile(deploy_path), f"Missing deploy config: {deploy_path}"
    with open(deploy_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    assert "resources" in config or ("cpu" in config and "memory" in config)
    assert "failure_behavior" in config
    assert "GCP_PROJECT_ID" in config
    assert "GCS_SOURCE_BUCKET" in config
    assert "BIGQUERY_DATASET" in config
    assert "BIGQUERY_TABLE" in config


def test_modules_ast_syntax():
    """Verifies all Python modules parse cleanly via AST."""
    modules = [
        "main.py",
        os.path.join("pipeline", "__init__.py"),
        os.path.join("pipeline", "gcs_reader.py"),
        os.path.join("pipeline", "transformer.py"),
        os.path.join("pipeline", "bq_loader.py"),
        os.path.join("pipeline", "run_daily_sales.py"),
    ]
    for mod in modules:
        assert os.path.isfile(mod), f"Module missing: {mod}"
        with open(mod, "r", encoding="utf-8") as f:
            code = f.read()
        tree = ast.parse(code)
        assert tree is not None, f"Failed AST parsing on {mod}"


@pytest.mark.skipif(pd is None, reason="pandas not installed in test environment")
def test_clean_and_transform_sales_pandas():
    """Verifies pandas data transformation when pandas is available."""
    from pipeline.transformer import clean_and_transform_sales

    raw_df = pd.DataFrame([
        {
            "order_id": " 1001 ",
            "customer_id": " CUST-001 ",
            "customer_name": "  Alice Johnson  ",
            "customer_email": "alice.j@example.com",
            "product_category": "Electronics",
            "amount": "$299.99",
            "currency": "usd",
            "order_status": "completed",
            "created_at": "2026-09-01T10:14:22Z",
        },
        {
            "order_id": "1002",
            "customer_id": "CUST-002",
            "customer_name": "Bob Smith",
            "customer_email": None,
            "product_category": "Home & Kitchen",
            "amount": "49.50",
            "currency": "USD",
            "order_status": "COMPLETED",
            "created_at": "2026-09-01T11:05:10Z",
        },
        # Duplicate of 1001 with later timestamp
        {
            "order_id": "1001",
            "customer_id": "CUST-001",
            "customer_name": "Alice Johnson Updated",
            "customer_email": "alice.j@example.com",
            "product_category": "Electronics",
            "amount": "349.99",
            "currency": "USD",
            "order_status": "COMPLETED",
            "created_at": "2026-09-01T15:30:00Z",
        },
        # Invalid row without order_id
        {
            "order_id": None,
            "customer_id": "CUST-999",
            "customer_name": "Ghost User",
            "customer_email": "ghost@example.com",
            "product_category": "Books",
            "amount": "10.00",
            "currency": "USD",
            "order_status": "PENDING",
            "created_at": "2026-09-01T16:00:00Z",
        },
    ])

    result = clean_and_transform_sales(raw_df)

    # 4 raw rows -> 1 invalid dropped, 1 duplicate removed -> 2 remaining
    assert len(result) == 2

    # Check columns
    assert "order_id" in result.columns
    assert "order_date" in result.columns
    assert "ingested_at" in result.columns

    # Check order_1001 took latest record
    order_1001 = result[result["order_id"] == "1001"].iloc[0]
    assert order_1001["customer_name"] == "Alice Johnson Updated"
    assert order_1001["amount"] == 349.99
    assert order_1001["currency"] == "USD"
    assert order_1001["order_status"] == "COMPLETED"
    assert order_1001["order_date"] == date(2026, 9, 1)
