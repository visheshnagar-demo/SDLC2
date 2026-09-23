"""Pipeline configuration management."""
import os
from dataclasses import dataclass


@dataclass
class Config:
    """ETL Pipeline Runtime Configuration."""
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID") or os.getenv("PROJECT_ID", "upbeat-repeater-477110-q6")
    GCS_SOURCE_URI: str = os.getenv("GCS_SOURCE_URI", "gs://sdlc-workspec-store/etl/data/raw_sales_data.csv")
    GCS_SOURCE_BUCKET: str = os.getenv("GCS_SOURCE_BUCKET", "sdlc-workspec-store")
    GCS_SOURCE_PREFIX: str = os.getenv("GCS_SOURCE_PREFIX", "etl/data/raw_sales_data.csv")
    BQ_DATASET: str = os.getenv("BQ_DATASET", "analytics")
    BQ_TABLE: str = os.getenv("BQ_TABLE", "daily_sales")
    CIRCUIT_BREAKER_MAX_ERROR_PCT: float = float(os.getenv("CIRCUIT_BREAKER_MAX_ERROR_PCT", "15.0"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    @classmethod
    def load(cls) -> "Config":
        """Load and validate configuration."""
        cfg = cls()
        if cfg.GCS_SOURCE_URI.startswith("gs://"):
            parts = cfg.GCS_SOURCE_URI[5:].split("/", 1)
            cfg.GCS_SOURCE_BUCKET = parts[0]
            if len(parts) > 1:
                cfg.GCS_SOURCE_PREFIX = parts[1]
        return cfg
