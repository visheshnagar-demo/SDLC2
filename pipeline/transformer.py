"""Data Cleansing, Transformation, and Deduplication Module."""
import re
import logging
from datetime import datetime
import pandas as pd

logger = logging.getLogger(__name__)

_FOOTNOTE_RE = re.compile(r"\[[^\]]*\]")
_NUMERIC_STRIP_RE = re.compile(r"[,$€£¥\s\u00a0]")


def clean_and_transform_sales(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans, normalizes, deduplicates, and derives fields for sales order data.

    Operations:
    1. Standardizes column names (snake_case).
    2. Drops fully empty / null rows.
    3. Trims whitespace and normalizes string columns.
    4. Coerces `amount` to numeric float after stripping any symbols.
    5. Parses `created_at` into UTC datetime.
    6. Derives `order_date` (DATE) from `created_at`.
    7. Deduplicates by `order_id`, keeping the latest record.
    8. Adds `ingested_at` UTC timestamp.
    """
    raw_count = len(df)
    if raw_count == 0:
        logger.warning("Empty dataframe received for transformation.")
        return df

    logger.info("Transforming %d raw records...", raw_count)

    # 1. Normalize column names
    df = df.copy()
    df.columns = [
        re.sub(r"[^a-zA-Z0-9_]+", "_", str(col).strip().lower()).strip("_")
        for col in df.columns
    ]

    # 2. Filter out rows where order_id or all columns are null
    df = df.dropna(how="all")
    if "order_id" in df.columns:
        df = df[df["order_id"].notna()]
        df = df[df["order_id"].astype(str).str.strip() != ""]
    
    valid_count = len(df)
    quarantined = raw_count - valid_count
    if quarantined > 0:
        logger.warning("Quarantined %d invalid/empty records", quarantined)

    if valid_count == 0:
        logger.error("FATAL: 100%% of raw records were invalid or missing order_id.")
        raise ValueError("Transformation failed: 0 valid records survived cleaning.")

    # 3. Clean string columns
    for col in df.select_dtypes(include=["object", "string"]).columns:
        df[col] = df[col].astype(str).str.strip().replace({"nan": None, "None": None, "": None})

    # Standardize specific fields
    if "order_id" in df.columns:
        df["order_id"] = df["order_id"].astype(str).str.strip()

    if "customer_id" in df.columns:
        df["customer_id"] = df["customer_id"].astype(str).str.strip()

    if "currency" in df.columns:
        df["currency"] = df["currency"].astype(str).str.strip().str.upper()

    if "order_status" in df.columns:
        df["order_status"] = df["order_status"].astype(str).str.strip().str.upper()

    # 4. Parse amount
    if "amount" in df.columns:
        df["amount"] = (
            df["amount"]
            .astype(str)
            .str.replace(_FOOTNOTE_RE, "", regex=True)
            .str.replace(_NUMERIC_STRIP_RE, "", regex=True)
            .str.strip()
        )
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")

    # 5. Parse created_at and derive order_date
    if "created_at" in df.columns:
        df["created_at"] = pd.to_datetime(df["created_at"], utc=True, errors="coerce")
        # Derive order_date from created_at
        df["order_date"] = df["created_at"].dt.date
    else:
        df["created_at"] = pd.Timestamp.utcnow()
        df["order_date"] = datetime.utcnow().date()

    # Fallback for null order_date
    if "order_date" in df.columns and df["order_date"].isna().any():
        df["order_date"] = df["order_date"].fillna(datetime.utcnow().date())

    # 6. Deduplicate by order_id (keep latest)
    before_dedup = len(df)
    if "order_id" in df.columns:
        if "created_at" in df.columns:
            df = df.sort_values("created_at")
        df = df.drop_duplicates(subset=["order_id"], keep="last")
    deduped_count = before_dedup - len(df)
    if deduped_count > 0:
        logger.info("Deduplicated %d duplicate order records (kept latest).", deduped_count)

    # 7. Add ingested_at timestamp (UTC)
    df["ingested_at"] = pd.Timestamp.utcnow()

    # Target column ordering if present
    target_columns = [
        "order_id",
        "order_date",
        "customer_id",
        "customer_name",
        "customer_email",
        "product_category",
        "amount",
        "currency",
        "order_status",
        "created_at",
        "ingested_at",
    ]
    present_cols = [c for c in target_columns if c in df.columns]
    extra_cols = [c for c in df.columns if c not in target_columns]
    df = df[present_cols + extra_cols]

    logger.info(
        "Transformation summary: raw=%d, quarantined=%d, deduped=%d, final_valid=%d",
        raw_count,
        quarantined,
        deduped_count,
        len(df),
    )
    return df
