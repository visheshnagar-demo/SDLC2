"""Main entry point for Sales ETL Cloud Run Job."""
import sys
import uuid
from server.config import Config
from server.clients.gcs_client import GCSClient
from server.clients.bq_client import BigQueryClient
from server.pipeline.extractor import extract_sales_data
from server.pipeline.validator import validate_and_filter
from server.pipeline.transformer import transform_sales_data
from server.pipeline.loader import load_sales_data
from server.utils.logger import get_logger

logger = get_logger("sales_etl_main")


def run_etl_pipeline() -> int:
    """Executes the full GCS -> Validation -> Transformation -> BigQuery ETL pipeline."""
    batch_id = str(uuid.uuid4())
    logger.info("Starting Sales ETL Cloud Run Job (Batch: %s)", batch_id)
    
    config = Config.load()
    gcs_client = GCSClient(project_id=config.GCP_PROJECT_ID)
    bq_client = BigQueryClient(project_id=config.GCP_PROJECT_ID)

    # 1. Extraction
    raw_df = extract_sales_data(
        bucket_name=config.GCS_SOURCE_BUCKET,
        blob_prefix=config.GCS_SOURCE_PREFIX,
        gcs_client=gcs_client
    )
    total_extracted = len(raw_df)

    # 2. Validation & Circuit Breaker
    valid_df, quarantined_df = validate_and_filter(
        df=raw_df,
        max_error_pct=config.CIRCUIT_BREAKER_MAX_ERROR_PCT
    )

    # 3. Transformation & Deduplication
    transformed_df = transform_sales_data(df=valid_df, batch_id=batch_id)
    total_to_load = len(transformed_df)
    duplicates_removed = len(valid_df) - total_to_load

    # 4. BigQuery Load
    rows_loaded = load_sales_data(df=transformed_df, bq_client=bq_client, config=config)

    logger.info(
        "Sales ETL Completed Successfully. Metrics: extracted=%d, valid=%d, quarantined=%d, duplicates_removed=%d, loaded=%d",
        total_extracted,
        len(valid_df),
        len(quarantined_df),
        duplicates_removed,
        rows_loaded
    )
    return 0


if __name__ == "__main__":
    try:
        status_code = run_etl_pipeline()
        sys.exit(status_code)
    except Exception as err:
        logger.critical("Fatal error in Sales ETL pipeline: %s", err, exc_info=True)
        sys.exit(1)
