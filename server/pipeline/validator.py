"""Data validation and circuit breaker module."""
from typing import Tuple
import pandas as pd
from server.utils.logger import get_logger

logger = get_logger("validator")


def validate_and_filter(df: pd.DataFrame, max_error_pct: float = 15.0) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Validates row-level integrity against required schema rules and enforces circuit breaker."""
    raw_count = len(df)
    if raw_count == 0:
        raise ValueError("Cannot validate an empty DataFrame.")

    required_columns = ["order_id", "amount", "created_at"]
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing mandatory columns in source data: {missing_cols}")

    # Check for non-null required columns and valid positive numeric amounts
    valid_order_id = df["order_id"].notna() & (df["order_id"].astype(str).str.strip() != "")
    valid_created_at = df["created_at"].notna() & (df["created_at"].astype(str).str.strip() != "")
    
    # Try coercing amount to float safely
    numeric_amount = pd.to_numeric(df["amount"], errors="coerce")
    valid_amount = numeric_amount.notna() & (numeric_amount >= 0)

    valid_mask = valid_order_id & valid_created_at & valid_amount

    valid_df = df[valid_mask].copy()
    quarantined_df = df[~valid_mask].copy()

    quarantined_count = len(quarantined_df)
    error_pct = (quarantined_count / raw_count) * 100.0

    logger.info(
        "Validation summary: total=%d, valid=%d, quarantined=%d (%.2f%%)",
        raw_count,
        len(valid_df),
        quarantined_count,
        error_pct
    )

    if error_pct > max_error_pct or len(valid_df) == 0:
        raise RuntimeError(
            f"Circuit breaker tripped: {error_pct:.2f}% error rate exceeds max allowed {max_error_pct:.2f}%."
        )

    return valid_df, quarantined_df
