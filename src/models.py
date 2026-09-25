"""Data models for Sales Order ETL Pipeline."""
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any
from datetime import datetime


@dataclass
class SalesOrderRecord:
    """Sales Order data record."""
    order_id: int
    customer_id: str
    customer_name: str
    currency: str
    order_status: str
    created_at: str
    _ingestion_timestamp: str
    customer_email: Optional[str] = None
    product_category: Optional[str] = None
    amount: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class ETLPipelineMetrics:
    """ETL Pipeline execution metrics payload for observability."""
    event: str
    source_uri: str
    target_table: str
    status: str
    rows_extracted: int
    rows_malformed_skipped: int
    rows_deduplicated: int
    rows_loaded: int
    duration_seconds: float

    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary."""
        return asdict(self)
