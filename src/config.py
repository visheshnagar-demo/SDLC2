"""Pipeline configuration loaded from environment variables."""
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class PipelineConfig:
    """ETL Pipeline Configuration settings."""
    gcs_source_uri: str = os.getenv(
        "GCS_SOURCE_URI",
        "gs://sdlc-workspec-store/etl/data/raw_sales_data.csv"
    )
    gcs_source_bucket: str = os.getenv("GCS_SOURCE_BUCKET", "sdlc-workspec-store")
    gcs_source_prefix: str = os.getenv("GCS_SOURCE_PREFIX", "etl/data/raw_sales_data.csv")
    gcp_project_id: str = (
        os.getenv("GCP_PROJECT_ID")
        or os.getenv("PROJECT_ID")
        or os.getenv("GOOGLE_CLOUD_PROJECT")
        or "upbeat-repeater-477110-q6"
    )
    bigquery_dataset: str = os.getenv("BIGQUERY_DATASET", "analytics")
    bigquery_table: str = os.getenv("BIGQUERY_TABLE", "vishesh-test1")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    batch_size: int = int(os.getenv("BATCH_SIZE", "10000"))

    @property
    def bigquery_table_ref(self) -> str:
        """Returns fully qualified BigQuery table reference."""
        if self.gcp_project_id:
            return f"{self.gcp_project_id}.{self.bigquery_dataset}.{self.bigquery_table}"
        return f"{self.bigquery_dataset}.{self.bigquery_table}"


config = PipelineConfig()
