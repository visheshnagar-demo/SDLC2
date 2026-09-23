"""Google BigQuery client wrapper."""
import os
import json
import pandas as pd
from google.cloud import bigquery
from server.utils.logger import get_logger

logger = get_logger("bq_client")


class BigQueryClient:
    """Wrapper for BigQuery load and table operations."""
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.client = bigquery.Client(project=project_id)

    def load_dataframe_to_table(
        self,
        df: pd.DataFrame,
        dataset_id: str,
        table_id: str,
        partition_field: str = "order_date",
        clustering_fields: list = None,
        schema_path: str = None
    ) -> int:
        """Loads a pandas DataFrame into a partitioned and clustered BigQuery table."""
        table_ref = f"{self.project_id}.{dataset_id}.{table_id}"
        logger.info("Preparing BigQuery load to %s with %d rows", table_ref, len(df))

        job_config = bigquery.LoadJobConfig(
            write_disposition=bigquery.WriteDisposition.WRITE_APPEND,
            time_partitioning=bigquery.TimePartitioning(
                type_=bigquery.TimePartitioningType.DAY,
                field=partition_field
            ) if partition_field else None,
            clustering_fields=clustering_fields or ["customer_id", "order_status"],
            schema_update_options=[
                bigquery.SchemaUpdateOption.ALLOW_FIELD_ADDITION,
                bigquery.SchemaUpdateOption.ALLOW_FIELD_RELAXATION,
            ]
        )

        if schema_path and os.path.exists(schema_path):
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_json = json.load(f)
            job_config.schema = [
                bigquery.SchemaField(
                    name=col["name"],
                    field_type=col["type"],
                    mode=col.get("mode", "NULLABLE"),
                    description=col.get("description")
                )
                for col in schema_json if col.get("name")
            ]

        job = self.client.load_table_from_dataframe(df, table_ref, job_config=job_config)
        job.result()

        if job.errors:
            raise RuntimeError(f"BigQuery load job failed with errors: {job.errors}")

        logger.info("BigQuery load completed successfully. Loaded %d rows.", len(df))
        return len(df)
