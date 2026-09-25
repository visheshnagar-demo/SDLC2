"""Unit and integration tests for Sales Order ETL pipeline."""
import io
import pytest

# Skip module if pandas or google cloud libraries are not installed in the test environment
pd = pytest.importorskip("pandas")
np = pytest.importorskip("numpy")

from unittest.mock import MagicMock, patch
from src.config import PipelineConfig
from src.models import SalesOrderRecord, ETLPipelineMetrics
from src.transformer import SalesDataTransformer
from src.extractor import GCSExtractor
from src.loader import BigQueryLoader
from src.main import run_pipeline


@pytest.fixture
def sample_raw_df():
    """Provides a realistic sample raw DataFrame with duplicates, nulls, and formatting quirks."""
    return pd.DataFrame({
        "order_id": ["1001", "1002", "1001", "1003", "1004", "invalid_id"],
        "customer_id": ["CUST-01", "CUST-02", "CUST-01", "CUST-03", "CUST-04", "CUST-05"],
        "customer_name": [" Alice ", "Bob", "Alice Updated", "Charlie", "Diana", "Eve"],
        "customer_email": ["ALICE@EXAMPLE.COM", "bob@example.com", "alice.updated@example.com", "", None, "eve@example.com"],
        "product_category": ["Electronics", "Books", "Electronics", "Clothing", None, "Home"],
        "amount": ["$299.99", "15.50", "$349.99", " 1,200.00 ", "invalid_amount", "50.00"],
        "currency": ["usd", "USD", "usd", "USD", "usd", "USD"],
        "order_status": ["completed", "PENDING", "completed", "shipped", "cancelled", "completed"],
        "created_at": [
            "2026-09-01T10:00:00Z",
            "2026-09-01T11:00:00Z",
            "2026-09-01T12:00:00Z",  # Later timestamp for 1001
            "2026-09-01T13:00:00Z",
            "2026-09-01T14:00:00Z",
            "2026-09-01T15:00:00Z",
        ]
    })


def test_transformer_cleaning_and_deduplication(sample_raw_df):
    """Verifies that transformer cleans strings, parses dates/numbers, and deduplicates records."""
    transformer = SalesDataTransformer()
    df_cleaned, stats = transformer.transform(sample_raw_df)

    # 1. Invalid order_id dropped ('invalid_id')
    assert "invalid_id" not in df_cleaned["order_id"].values
    assert len(df_cleaned) == 4  # 1001, 1002, 1003, 1004

    # 2. Deduplication on order_id=1001 kept the latest record (amount 349.99)
    order_1001 = df_cleaned[df_cleaned["order_id"] == 1001].iloc[0]
    assert order_1001["customer_name"] == "Alice Updated"
    assert order_1001["amount"] == 349.99

    # 3. String normalization
    order_1002 = df_cleaned[df_cleaned["order_id"] == 1002].iloc[0]
    assert order_1002["currency"] == "USD"
    assert order_1002["order_status"] == "PENDING"

    # 4. Null email handling (mandatory pd.isna check)
    order_1003 = df_cleaned[df_cleaned["order_id"] == 1003].iloc[0]
    assert pd.isna(order_1003["customer_email"]) or order_1003["customer_email"] is None

    # 5. Currency / commas stripped from amount
    order_1003_amount = order_1003["amount"]
    assert order_1003_amount == 1200.00

    # 6. Audit timestamp added
    assert "_ingestion_timestamp" in df_cleaned.columns
    assert stats["rows_extracted"] == 6
    assert stats["rows_deduplicated"] == 1
    assert stats["rows_loaded"] == 4


def test_transformer_circuit_breaker_on_all_malformed():
    """Verifies that transformer raises RuntimeError when 100% of rows are invalid."""
    bad_df = pd.DataFrame({
        "order_id": ["not_a_number", "bad_id"],
        "customer_name": ["Foo", "Bar"],
    })
    transformer = SalesDataTransformer()
    with pytest.raises(RuntimeError) as exc_info:
        transformer.transform(bad_df)
    assert "malformed" in str(exc_info.value).lower()


def test_models_serialization():
    """Verifies dataclass models serialization."""
    record = SalesOrderRecord(
        order_id=101,
        customer_id="C-1",
        customer_name="John Doe",
        currency="USD",
        order_status="COMPLETED",
        created_at="2026-09-01T10:00:00Z",
        _ingestion_timestamp="2026-09-01T10:05:00Z",
        amount=199.99,
    )
    d = record.to_dict()
    assert d["order_id"] == 101
    assert d["amount"] == 199.99

    metrics = ETLPipelineMetrics(
        event="etl_job_completed",
        source_uri="gs://test/file.csv",
        target_table="analytics.test",
        status="SUCCESS",
        rows_extracted=100,
        rows_malformed_skipped=5,
        rows_deduplicated=10,
        rows_loaded=85,
        duration_seconds=1.23,
    )
    m = metrics.to_dict()
    assert m["rows_loaded"] == 85
    assert m["status"] == "SUCCESS"


@patch("src.extractor.storage.Client")
def test_extractor_success(mock_storage_client):
    """Verifies GCS extractor downloads and parses CSV bytes."""
    mock_client_inst = MagicMock()
    mock_bucket = MagicMock()
    mock_blob = MagicMock()
    mock_blob.exists.return_value = True
    csv_bytes = b"order_id,customer_id,customer_name\n1,C1,Alice\n2,C2,Bob\n"
    mock_blob.download_as_bytes.return_value = csv_bytes

    mock_bucket.blob.return_value = mock_blob
    mock_client_inst.bucket.return_value = mock_bucket
    mock_storage_client.return_value = mock_client_inst

    extractor = GCSExtractor(uri="gs://test-bucket/test.csv")
    df = extractor.extract()
    assert len(df) == 2
    assert list(df.columns) == ["order_id", "customer_id", "customer_name"]


@patch("src.loader.bigquery.Client")
def test_loader_load(mock_bq_client):
    """Verifies BigQuery loader configures job and executes load_table_from_dataframe."""
    mock_client_inst = MagicMock()
    mock_load_job = MagicMock()
    mock_load_job.result.return_value = None
    mock_client_inst.load_table_from_dataframe.return_value = mock_load_job
    mock_bq_client.return_value = mock_client_inst

    loader = BigQueryLoader(project_id="test-proj", dataset_id="analytics", table_id="vishesh-test1")
    df = pd.DataFrame({
        "order_id": [1, 2],
        "customer_id": ["C1", "C2"],
        "created_at": pd.to_datetime(["2026-09-01", "2026-09-02"]),
        "order_status": ["COMPLETED", "PENDING"]
    })
    rows = loader.load(df)
    assert rows == 2
    assert mock_client_inst.load_table_from_dataframe.called


@patch("src.main.GCSExtractor")
@patch("src.main.BigQueryLoader")
def test_run_pipeline_e2e(mock_loader_cls, mock_extractor_cls):
    """Verifies full pipeline orchestration returns exit code 0 on success."""
    mock_ext = MagicMock()
    mock_ext.extract.return_value = pd.DataFrame({
        "order_id": [1001, 1002],
        "customer_id": ["C1", "C2"],
        "customer_name": ["Alice", "Bob"],
        "customer_email": ["alice@test.com", "bob@test.com"],
        "product_category": ["Electronics", "Books"],
        "amount": [100.0, 50.0],
        "currency": ["USD", "USD"],
        "order_status": ["COMPLETED", "PENDING"],
        "created_at": ["2026-09-01T10:00:00Z", "2026-09-01T11:00:00Z"],
    })
    mock_extractor_cls.return_value = mock_ext

    mock_load = MagicMock()
    mock_load.load.return_value = 2
    mock_loader_cls.return_value = mock_load

    exit_code = run_pipeline()
    assert exit_code == 0
