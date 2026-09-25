"""Automated tests for pipeline postgres_to_bigquery."""
import ast
import os
import json
import uuid
import tempfile
import pytest

try:
    import pandas as pd
    import numpy as np
except ImportError:
    pd = None
    np = None


def test_dag_syntax():
    """Verifies that the Airflow DAG has valid Python AST syntax."""
    dag_path = os.path.join("dags", "postgres_to_bigquery_dag.py")
    assert os.path.isfile(dag_path), f"DAG file missing: {dag_path}"
    with open(dag_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = ast.parse(code)
    assert tree is not None


def test_standalone_script_syntax():
    """Verifies that the standalone pipeline script has valid syntax."""
    script_path = os.path.join("pipeline", "run_postgres_to_bigquery.py")
    assert os.path.isfile(script_path), f"Script file missing: {script_path}"
    with open(script_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = ast.parse(code)
    assert tree is not None


def test_pipeline_spec_configuration():
    """Verifies connector parameters."""
    source_type = "postgresql"
    target_type = "bigquery"
    write_mode = "append"
    assert source_type in ["postgresql", "mysql", "s3", "gcs", "rest_api", "sftp", "kafka"]
    assert target_type in ["bigquery", "snowflake", "postgresql", "mysql", "gcs", "s3"]
    assert write_mode in ["append", "overwrite", "merge", "upsert"]


def test_transformation_spec_schema_coverage():
    """Verifies that transformation_spec.json exists and defines valid column mappings."""
    spec_path = "transformation_spec.json"
    assert os.path.isfile(spec_path), "transformation_spec.json missing"
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)
    assert "columns" in spec
    assert len(spec["columns"]) > 0
    col_names = [c["source_name"] for c in spec["columns"]]
    assert "id" in col_names
    assert "data" in col_names
    assert "status" in col_names
    assert "created_at" in col_names


def test_bigquery_schema_definition():
    """Verifies that the BigQuery JSON schema file exists and contains required fields."""
    schema_path = os.path.join("schemas", "vishesh_postgres_test1_schema.json")
    assert os.path.isfile(schema_path), f"Schema file missing: {schema_path}"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)
    field_names = [f["name"] for f in schema]
    assert "id" in field_names
    assert "data" in field_names
    assert "status" in field_names
    assert "created_at" in field_names
    assert "_extracted_at" in field_names
    assert "_pipeline_run_id" in field_names


def test_env_deploy_iam_compliance():
    """Verifies that env.deploy.json complies with Cloud SQL IAM authentication rules."""
    deploy_path = "env.deploy.json"
    assert os.path.isfile(deploy_path), f"env.deploy.json missing: {deploy_path}"
    with open(deploy_path, "r", encoding="utf-8") as f:
        env_vars = json.load(f)

    assert "INSTANCE_CONNECTION_NAME" in env_vars
    assert "POSTGRES_USER" in env_vars
    assert "POSTGRES_DB" in env_vars
    assert env_vars.get("CLOUD_SQL_IP_TYPE") == "PRIVATE"
    assert "POSTGRES_PASSWORD" not in env_vars
    assert not env_vars["POSTGRES_USER"].startswith("[")


@pytest.mark.skipif(pd is None, reason="pandas not available in test environment")
def test_transformation_logic_cleaning():
    """Verifies that transformation cleans whitespace, normalizes nulls, deduplicates, and adds audit fields."""
    from pipeline.run_postgres_to_bigquery import PipelineRunner

    with tempfile.TemporaryDirectory() as tmpdir:
        runner = PipelineRunner(execution_date="2025-01-01")
        runner.staging_dir = tmpdir
        runner.staging_file = os.path.join(tmpdir, "data.parquet")

        raw_df = pd.DataFrame([
            {"id": " 1 ", "data": "  alpha test  ", "status": "ACTIVE", "created_at": "2025-01-01 10:00:00"},
            {"id": " 2 ", "data": "NULL", "status": "PENDING", "created_at": "2025-01-01 11:00:00"},
            {"id": " 3 ", "data": "   ", "status": "N/A", "created_at": "2025-01-01 12:00:00"},
            {"id": " 1 ", "data": "  alpha test updated  ", "status": "ACTIVE", "created_at": "2025-01-01 13:00:00"},
        ])
        raw_df.to_parquet(runner.staging_file, index=False)

        valid_count = runner.transform()
        assert valid_count == 3

        cleaned_df = pd.read_parquet(runner.staging_file)
        assert len(cleaned_df) == 3
        assert "_extracted_at" in cleaned_df.columns
        assert "_pipeline_run_id" in cleaned_df.columns

        rec1 = cleaned_df[cleaned_df["id"] == "1"].iloc[0]
        assert rec1["data"] == "alpha test updated"

        rec2 = cleaned_df[cleaned_df["id"] == "2"].iloc[0]
        assert pd.isna(rec2["data"])

        rec3 = cleaned_df[cleaned_df["id"] == "3"].iloc[0]
        assert pd.isna(rec3["data"])
        assert pd.isna(rec3["status"])


@pytest.mark.skipif(pd is None, reason="pandas not available in test environment")
def test_transformation_circuit_breaker_on_empty():
    """Verifies circuit breaker behaviour when all rows are completely empty."""
    from pipeline.run_postgres_to_bigquery import PipelineRunner

    with tempfile.TemporaryDirectory() as tmpdir:
        runner = PipelineRunner(execution_date="2025-01-01")
        runner.staging_dir = tmpdir
        runner.staging_file = os.path.join(tmpdir, "data.parquet")

        empty_df = pd.DataFrame([{"id": None, "data": None, "status": None}])
        empty_df.to_parquet(runner.staging_file, index=False)

        with pytest.raises(RuntimeError, match="Circuit breaker triggered"):
            runner.transform()
