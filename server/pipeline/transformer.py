"""Data transformation, cleaning, and deduplication engine."""
import uuid
from datetime import datetime, timezone
import pandas as pd
from server.utils.logger import get_logger

logger = get_logger("transformer")


def transform_sales_data(df: pd.DataFrame, batch_id: str = None) -> pd.DataFrame:
    """Standardizes fields, casts types, deduplicates on order_id, and derives partition fields."""
    if df.empty:
        raise ValueError("Cannot transform an empty DataFrame.")

    batch_uuid = batch_id or str(uuid.uuid4())
    ingest_time = datetime.now(timezone.utc).isoformat()
    logger.info("Transforming %d records with batch_id: %s", len(df), batch_uuid)

    transformed = df.copy()

    # Whitespace stripping and string standardization
    for col in transformed.select_dtypes(include=["object", "string"]).columns:
        transformed[col] = transformed[col].astype(str).str.strip().replace({"nan": None, "None": None, "": None})

    # Type casting and derivations
    transformed["order_id"] = transformed["order_id"].astype(str).str.strip()
    transformed["customer_id"] = transformed["customer_id"].astype(str).str.strip()
    
    if "customer_name" in transformed.columns:
        transformed["customer_name"] = transformed["customer_name"].astype(str).str.strip().replace({"nan": None, "None": None})
    else:
        transformed["customer_name"] = None

    if "customer_email" in transformed.columns:
        transformed["customer_email"] = transformed["customer_email"].astype(str).str.strip().str.lower().replace({"nan": None, "None": None})
    else:
        transformed["customer_email"] = None

    if "product_category" in transformed.columns:
        transformed["product_category"] = transformed["product_category"].astype(str).str.strip().replace({"nan": None, "None": None})
    else:
        transformed["product_category"] = None

    transformed["amount"] = pd.to_numeric(transformed["amount"], errors="coerce").astype(float)
    
    if "currency" in transformed.columns:
        transformed["currency"] = transformed["currency"].astype(str).str.strip().str.upper().replace({"nan": "USD", "None": "USD"})
    else:
        transformed["currency"] = "USD"

    if "order_status" in transformed.columns:
        transformed["order_status"] = transformed["order_status"].astype(str).str.strip().str.upper().replace({"nan": "PENDING", "None": "PENDING"})
    else:
        transformed["order_status"] = "PENDING"

    # Datetime handling
    parsed_dates = pd.to_datetime(transformed["created_at"], utc=True, errors="coerce")
    transformed["created_at"] = parsed_dates
    transformed["order_date"] = parsed_dates.dt.date

    # Deduplication on business key: order_id
    initial_count = len(transformed)
    transformed = transformed.sort_values(by="created_at").drop_duplicates(subset=["order_id"], keep="last")
    deduped_count = initial_count - len(transformed)
    logger.info("Deduplication removed %d duplicate records based on order_id", deduped_count)

    # System tracking metadata
    transformed["ingested_at"] = pd.to_datetime(ingest_time)
    transformed["batch_id"] = batch_uuid

    target_columns = [
        "order_id",
        "customer_id",
        "customer_name",
        "customer_email",
        "product_category",
        "amount",
        "currency",
        "order_status",
        "created_at",
        "order_date",
        "ingested_at",
        "batch_id"
    ]
    
    # Ensure all target columns exist
    for col in target_columns:
        if col not in transformed.columns:
            transformed[col] = None

    final_df = transformed[target_columns].copy()
    logger.info("Transformation finished with %d clean records ready for loading", len(final_df))
    return final_df
