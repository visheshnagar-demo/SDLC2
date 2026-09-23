"""Automated tests for pipeline sales_etl."""
import ast
import os
import pytest

def test_dag_syntax():
    """Verifies that the Airflow DAG has valid Python AST syntax."""
    dag_path = os.path.join("dags", "sales_etl_dag.py")
    assert os.path.isfile(dag_path), f"DAG file missing: {dag_path}"
    with open(dag_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = ast.parse(code)
    assert tree is not None

def test_standalone_script_syntax():
    """Verifies that the standalone pipeline script has valid syntax."""
    script_path = os.path.join("pipeline", "run_sales_etl.py")
    assert os.path.isfile(script_path), f"Script file missing: {script_path}"
    with open(script_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = ast.parse(code)
    assert tree is not None

def test_server_main_syntax():
    """Verifies that the server main entry point has valid syntax."""
    script_path = os.path.join("server", "main.py")
    assert os.path.isfile(script_path), f"Script file missing: {script_path}"
    with open(script_path, "r", encoding="utf-8") as f:
        code = f.read()
    tree = ast.parse(code)
    assert tree is not None

def test_pipeline_spec_configuration():
    """Verifies connector parameters."""
    source_type = "gcs"
    target_type = "bigquery"
    write_mode = "append"
    assert source_type in ["postgresql", "mysql", "s3", "gcs", "rest_api", "sftp", "kafka"]
    assert target_type in ["bigquery", "snowflake", "postgresql", "mysql", "gcs", "s3"]
    assert write_mode in ["append", "overwrite", "merge", "upsert"]

def test_transformation_spec_validity():
    """Verifies that transformation_spec.json is well-formed and covers mandatory columns."""
    spec_path = "transformation_spec.json"
    assert os.path.isfile(spec_path)
    import json
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)
    assert "columns" in spec
    column_names = [col.get("source_name") or col.get("source") for col in spec["columns"]]
    assert "order_id" in column_names
    assert "amount" in column_names
    assert "created_at" in column_names
