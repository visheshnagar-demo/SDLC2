"""BigQuery Target Loader Module for Daily Sales Data."""
import os
import logging
import pandas as pd
from google.cloud import bigquery
from google.cloud.exceptions import NotFound

logger = logging.getLogger(__name__)


def ensure_bigquery_table(
    client: bigquery.Client,
    table_ref: str,
    schema: list,
    partition_field: str = "order_date",
    clustering_fields: list = None,
) -> bigquery.Table:
    """Ensures BigQuery table exists with appropriate partitioning and clustering."""
    try:
        table = client.get_table(table_ref)
        logger.info("Target BigQuery table %s exists.", table_ref)
        return table
    except NotFound:
        logger.info("Creating BigQuery table %s with partitioning on %s...", table_ref, partition_field)
        table = bigquery.Table(table_ref, schema=schema)
        
        if partition_field:
            table.time_partitioning = bigquery.TimePartitioning(
                type_=bigquery.TimePartitioningType.DAY,
                field=partition_field,
            )
        if clustering_fields:
            table.clustering_fields = clustering_fields

        created_table = client.create_table(table)
        logger.info("Successfully created partitioned BigQuery table: %s", table_ref)
        return created_table


def load_to_bigquery(
    df: pd.DataFrame,
    project_id: str,
    dataset_id: str = "analytics",
    table_id: str = "daily_sales",
    partition_field: str = "order_date",
    clustering_fields: list = None,
    write_mode: str = "append",
    schema_file: str = "schemas/daily_sales_schema.json",
) -> int:
    """Loads a transformed Pandas DataFrame into Google BigQuery.

    Zero-Mock Policy: Executes real BigQuery LoadJob. Fails fast if configuration is missing.
    """
    if df is None or len(df) == 0:
        logger.warning("Empty dataframe provided to BigQuery loader. Skipping load.")
        return 0

    if not project_id:
        raise EnvironmentError("FATAL: GCP_PROJECT_ID or PROJECT_ID must be set for BigQuery loading.")

    client = bigquery.Client(project=project_id)
    dataset_ref = f"{project_id}.{dataset_id}"
    table_ref = f"{project_id}.{dataset_id}.{table_id}"

    # Ensure dataset exists
    try:
        client.get_dataset(dataset_ref)
    except NotFound:
        logger.info("Creating BigQuery dataset %s...", dataset_ref)
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = os.getenv("BQ_LOCATION", "us-central1")
        client.create_dataset(dataset, exists_ok=True)

    # Load schema from JSON if available
    schema = None
    if schema_file and os.path.exists(schema_file):
        try:
            schema = client.schema_from_json(schema_file)
            logger.info("Loaded schema definition from %s", schema_file)
        except Exception as exc:
            logger.warning("Could not parse schema from %s: %s", schema_file, exc)
            raise RuntimeError(f"FATAL: Failed to parse BigQuery schema JSON: {exc}") from exc

    # Ensure table exists with partitioning & clustering
    clustering = clustering_fields if clustering_fields is not None else ["customer_id", "order_status"]
    ensure_bigquery_table(
        client=client,
        table_ref=table_ref,
        schema=schema,
        partition_field=partition_field,
        clustering_fields=clustering,
    )

    # Configure load job
    write_disp = (
        bigquery.WriteDisposition.WRITE_APPEND
        if write_mode == "append"
        else bigquery.WriteDisposition.WRITE_TRUNCATE
    )
    job_config = bigquery.LoadJobConfig(
        write_disposition=write_disp,
    )
    if schema:
        job_config.schema = schema

    if write_mode == "append":
        job_config.schema_update_options = [
            bigquery.SchemaUpdateOption.ALLOW_FIELD_ADDITION,
            bigquery.SchemaUpdateOption.ALLOW_FIELD_RELAXATION,
        ]

    logger.info("Starting BigQuery load job for %d records into %s...", len(df), table_ref)
    job = client.load_table_from_dataframe(df, table_ref, job_config=job_config)
    job.result()  # Wait for completion

    if job.errors:
        raise RuntimeError(f"FATAL: BigQuery load job failed with errors: {job.errors}")

    logger.info("Successfully loaded %d records into BigQuery table: %s", len(df), table_ref)
    return len(df)
