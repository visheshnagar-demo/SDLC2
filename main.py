"""Main Batch Entrypoint for ETL Sales Order Cloud Run Job."""
import os
import sys
import json
import time
import logging
from datetime import datetime

from pipeline.gcs_reader import extract_gcs_data
from pipeline.transformer import clean_and_transform_sales
from pipeline.bq_loader import load_to_bigquery

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
)
logger = logging.getLogger("etl_sales_job")


def run_pipeline() -> None:
    """Executes the batch ETL pipeline from GCS to BigQuery."""
    start_time = time.time()
    logger.info("=== Starting ETL Sales Order Pipeline Execution ===")

    # Configuration from Environment Variables
    bucket_name = os.getenv("GCS_SOURCE_BUCKET", "sdlc-workspec-store")
    source_prefix = os.getenv("GCS_SOURCE_PREFIX", "etl/data/raw_sales_data.csv")
    project_id = (
        os.getenv("GCP_PROJECT_ID")
        or os.getenv("PROJECT_ID")
        or os.getenv("GOOGLE_CLOUD_PROJECT")
        or "upbeat-repeater-477110-q6"
    )
    dataset_id = os.getenv("BIGQUERY_DATASET", "analytics")
    table_id = os.getenv("BIGQUERY_TABLE", "daily_sales")
    partition_field = os.getenv("BQ_PARTITION_FIELD", "order_date")
    write_mode = os.getenv("BQ_WRITE_MODE", "append")

    try:
        # Step 1: Extract from GCS
        logger.info("Step 1/3: Extracting data from GCS gs://%s/%s...", bucket_name, source_prefix)
        raw_df = extract_gcs_data(
            bucket_name=bucket_name,
            prefix_or_file=source_prefix,
            local_staging_dir="staging/raw",
        )
        records_extracted = len(raw_df)

        # Step 2: Transform and Deduplicate
        logger.info("Step 2/3: Transforming, cleaning, and deduplicating records...")
        transformed_df = clean_and_transform_sales(raw_df)
        records_loaded = len(transformed_df)
        records_deduped = records_extracted - records_loaded

        # Step 3: Load to BigQuery
        logger.info(
            "Step 3/3: Loading %d records into BigQuery table %s.%s.%s...",
            records_loaded,
            project_id,
            dataset_id,
            table_id,
        )
        load_to_bigquery(
            df=transformed_df,
            project_id=project_id,
            dataset_id=dataset_id,
            table_id=table_id,
            partition_field=partition_field,
            clustering_fields=["customer_id", "order_status"],
            write_mode=write_mode,
            schema_file="schemas/daily_sales_schema.json",
        )

        duration = round(time.time() - start_time, 2)
        audit_metric = {
            "event": "etl_job_summary",
            "job_name": "etl-sales-pipeline",
            "source_uri": f"gs://{bucket_name}/{source_prefix}",
            "target_table": f"{project_id}.{dataset_id}.{table_id}",
            "records_extracted": records_extracted,
            "records_deduplicated_or_dropped": records_deduped,
            "records_loaded": records_loaded,
            "duration_seconds": duration,
            "status": "SUCCESS",
            "timestamp": datetime.utcnow().isoformat(),
        }
        logger.info("Pipeline completed successfully:\n%s", json.dumps(audit_metric, indent=2))

    except Exception as exc:
        duration = round(time.time() - start_time, 2)
        error_metric = {
            "event": "etl_job_summary",
            "job_name": "etl-sales-pipeline",
            "duration_seconds": duration,
            "status": "FAILED",
            "error": str(exc),
            "timestamp": datetime.utcnow().isoformat(),
        }
        logger.critical("Pipeline FAILED with unhandled error:\n%s", json.dumps(error_metric, indent=2), exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    run_pipeline()
    sys.exit(0)
