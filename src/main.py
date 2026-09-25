"""Main entrypoint for Cloud Run Job Sales Order ETL Pipeline."""
import sys
import time
import json
import logging
from src.config import config
from src.models import ETLPipelineMetrics
from src.extractor import GCSExtractor
from src.transformer import SalesDataTransformer
from src.loader import BigQueryLoader

logging.basicConfig(
    level=getattr(logging, config.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
)
logger = logging.getLogger("sales_order_etl")


def run_pipeline() -> int:
    """Executes the Sales Order ETL batch pipeline.

    Returns:
        Exit code: 0 on success, exits process on failure.
    """
    start_time = time.time()
    source_uri = config.gcs_source_uri
    target_table = config.bigquery_table_ref
    stats = {
        "rows_extracted": 0,
        "rows_malformed_skipped": 0,
        "rows_deduplicated": 0,
        "rows_loaded": 0,
    }

    logger.info("=== Starting Sales Order ETL Batch Pipeline ===")
    logger.info("Source GCS URI: %s", source_uri)
    logger.info("Target BigQuery: %s", target_table)

    try:
        # Step 1: Extraction
        extractor = GCSExtractor(
            uri=source_uri,
            bucket=config.gcs_source_bucket,
            prefix=config.gcs_source_prefix,
        )
        df_raw = extractor.extract()
        stats["rows_extracted"] = len(df_raw)

        # Step 2: Transformation & Deduplication
        transformer = SalesDataTransformer()
        df_cleaned, transform_stats = transformer.transform(df_raw)
        stats.update(transform_stats)

        # Step 3: Loading into BigQuery
        loader = BigQueryLoader(
            project_id=config.gcp_project_id,
            dataset_id=config.bigquery_dataset,
            table_id=config.bigquery_table,
        )
        rows_loaded = loader.load(df_cleaned, write_mode="append")
        stats["rows_loaded"] = rows_loaded

        duration = round(time.time() - start_time, 2)
        metrics = ETLPipelineMetrics(
            event="etl_job_completed",
            source_uri=source_uri,
            target_table=target_table,
            status="SUCCESS",
            rows_extracted=stats["rows_extracted"],
            rows_malformed_skipped=stats["rows_malformed_skipped"],
            rows_deduplicated=stats["rows_deduplicated"],
            rows_loaded=stats["rows_loaded"],
            duration_seconds=duration,
        )
        print(json.dumps(metrics.to_dict(), indent=2))
        logger.info("Pipeline execution completed in %.2fs with status=SUCCESS", duration)
        return 0

    except Exception as exc:
        logger.critical("Pipeline execution FAILED: %s", exc, exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    code = run_pipeline()
    sys.exit(code)
