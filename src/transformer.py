"""Data transformation and cleansing module."""
import re
import logging
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


class SalesDataTransformer:
    """Cleanses, normalizes, and deduplicates sales order records."""

    def __init__(self):
        self._numeric_strip_re = re.compile(r"[,$€£¥\s\u00a0]")
        self._footnote_re = re.compile(r"\[[^\]]*\]")

    @staticmethod
    def _clean_str(val: Any) -> Optional[str]:
        """Safely cleans and strips string values, handling float NaN / None."""
        if val is None or pd.isna(val):
            return None
        s = str(val).strip()
        if s.lower() in ("nan", "none", "null", "nat", ""):
            return None
        return s

    def _clean_numeric(self, series: pd.Series) -> pd.Series:
        """Strip currency symbols, commas, and whitespace before casting to numeric."""
        return (
            series.astype(str)
            .str.replace(self._footnote_re, "", regex=True)
            .str.replace(self._numeric_strip_re, "", regex=True)
            .str.strip()
        )

    def transform(self, df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes end-to-end cleaning and deduplication.

        Args:
            df_raw: Raw input DataFrame from GCS.

        Returns:
            Tuple of (cleaned_df, transformation_stats)
        """
        raw_count = len(df_raw)
        if raw_count == 0:
            return pd.DataFrame(), {
                "rows_extracted": 0,
                "rows_malformed_skipped": 0,
                "rows_deduplicated": 0,
                "rows_loaded": 0,
            }

        df = df_raw.copy()

        # 1. Standardize column names
        df.columns = [
            re.sub(r"[^a-zA-Z0-9_]+", "_", str(col).strip().lower()).strip("_")
            for col in df.columns
        ]

        # 2. Filter out rows where essential primary identifier (order_id) is missing or all null
        df = df.dropna(how="all")
        if "order_id" in df.columns:
            # Drop invalid / non-numeric order_id
            df["order_id"] = pd.to_numeric(df["order_id"], errors="coerce")
            valid_id_mask = df["order_id"].notna()
            malformed_count = int((~valid_id_mask).sum())
            df = df[valid_id_mask].copy()
            df["order_id"] = df["order_id"].astype("int64")
        else:
            malformed_count = 0

        # Circuit breaker: if all rows were malformed
        if len(df) == 0:
            raise RuntimeError(
                f"FATAL: All {raw_count} raw records were malformed or missing order_id."
            )

        # 3. Clean string columns safely handling floats, NaN, nulls
        for col in ["customer_id", "customer_name", "product_category"]:
            if col in df.columns:
                df[col] = df[col].apply(self._clean_str)

        if "customer_email" in df.columns:
            df["customer_email"] = df["customer_email"].apply(
                lambda v: self._clean_str(v).lower() if self._clean_str(v) is not None else None
            )

        if "currency" in df.columns:
            df["currency"] = df["currency"].apply(
                lambda v: self._clean_str(v).upper() if self._clean_str(v) is not None else "USD"
            )

        if "order_status" in df.columns:
            df["order_status"] = df["order_status"].apply(
                lambda v: self._clean_str(v).upper() if self._clean_str(v) is not None else "PENDING"
            )

        # 4. Clean numeric columns (amount)
        if "amount" in df.columns:
            if pd.api.types.is_string_dtype(df["amount"]) or pd.api.types.is_object_dtype(df["amount"]):
                cleaned_amount = self._clean_numeric(df["amount"])
                df["amount"] = pd.to_numeric(cleaned_amount, errors="coerce")
            else:
                df["amount"] = pd.to_numeric(df["amount"], errors="coerce")

        # 5. Parse timestamp columns (created_at)
        if "created_at" in df.columns:
            df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce", utc=True)

        # 6. Deduplication on order_id (keep latest created_at or last record)
        before_dedup = len(df)
        if "created_at" in df.columns:
            df = df.sort_values(by="created_at", ascending=True, na_position="first")
        df = df.drop_duplicates(subset=["order_id"], keep="last")
        deduplicated_count = before_dedup - len(df)

        # 7. Add audit ingestion timestamp
        ingestion_ts = datetime.now(timezone.utc)
        df["_ingestion_timestamp"] = ingestion_ts

        stats = {
            "rows_extracted": raw_count,
            "rows_malformed_skipped": malformed_count + (raw_count - before_dedup - malformed_count),
            "rows_deduplicated": deduplicated_count,
            "rows_loaded": len(df),
        }
        logger.info(
            "Transformation completed: raw=%d, malformed_skipped=%d, deduplicated=%d, valid=%d",
            raw_count,
            stats["rows_malformed_skipped"],
            deduplicated_count,
            len(df),
        )
        return df, stats
