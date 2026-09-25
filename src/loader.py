"""BigQuery Table Loader module."""
import os
import logging
import pandas as pd
from google.cloud import bigquery
from google.api_core.exceptions import NotFound

logger = logging.getLogger(__name__)


class BigQueryLoader:
    """Loads cleansed and deduplicated sales records into partitioned BigQuery table."""

    def __init__(
        self,
        project_id: str = None,
        dataset_id: str = None,
        table_id: str = None,
        schema_path: str = None,
    ):
        self.project_id = (
            project_id
            or os.getenv("GCP_PROJECT_ID")
            or os.getenv("PROJECT_ID")
            or os.getenv("GOOGLE_CLOUD_PROJECT")
            or "upbeat-repeater-477110-q6"
        )
        self.dataset_id = dataset_id or os.getenv("BIGQUERY_DATASET", "analytics")
        self.table_id = table_id or os.getenv("BIGQUERY_TABLE", "vishesh-test1")
        self.schema_path = schema_path or self._resolve_schema_path()
        try:
            self.client = bigquery.Client(project=self.project_id) if self.project_id else bigquery.Client()
        except Exception as exc:
            logger.critical("Failed to initialize BigQuery client: %s", exc)
            raise exc

    def _resolve_schema_path(self) -> str:
        candidates = [
            os.path.join("schemas", "sales_order_schema.json"),
            os.path.join("schemas", "vishesh-test1_schema.json"),
            os.path.join("schemas", "target_table_schema.json"),
        ]
        for cand in candidates:
            if os.path.isfile(cand):
                return cand
        return ""

    @property
    def table_ref(self) -> str:
        if self.project_id:
            return f"{self.project_id}.{self.dataset_id}.{self.table_id}"
        return f"{self.dataset_id}.{self.table_id}"

    def ensure_dataset(self) -> None:
        """Ensures target dataset exists."""
        dataset_ref = bigquery.DatasetReference(self.project_id, self.dataset_id)
        try:
            self.client.get_dataset(dataset_ref)
        except NotFound:
            ds = bigquery.Dataset(dataset_ref)
            ds.location = os.getenv("BQ_LOCATION", "us-central1")
            self.client.create_dataset(ds, exists_ok=True)
            logger.info("Created BigQuery dataset: %s", dataset_ref)
        except Exception as exc:
            logger.critical("Failed to check or create BigQuery dataset: %s", exc)
            raise exc

    def load(self, df: pd.DataFrame, write_mode: str = "append") -> int:
        """Loads DataFrame into BigQuery target table.

        Args:
            df: Cleansed DataFrame.
            write_mode: "append" or "overwrite".

        Returns:
            Number of rows loaded.
        """
        if df.empty:
            logger.warning("Empty DataFrame passed to loader. Skipping BigQuery load.")
            return 0

        self.ensure_dataset()

        df_to_load = df.copy()

        job_config = bigquery.LoadJobConfig(
            write_disposition=(
                bigquery.WriteDisposition.WRITE_APPEND
                if write_mode == "append"
                else bigquery.WriteDisposition.WRITE_TRUNCATE
            ),
            create_disposition=bigquery.CreateDisposition.CREATE_IF_NEEDED,
        )

        if "created_at" in df_to_load.columns:
            job_config.time_partitioning = bigquery.TimePartitioning(
                type_=bigquery.TimePartitioningType.DAY,
                field="created_at",
            )
        if "customer_id" in df_to_load.columns and "order_status" in df_to_load.columns:
            job_config.clustering_fields = ["customer_id", "order_status"]

        if write_mode == "append":
            job_config.schema_update_options = [
                bigquery.SchemaUpdateOption.ALLOW_FIELD_ADDITION,
                bigquery.SchemaUpdateOption.ALLOW_FIELD_RELAXATION,
            ]

        if self.schema_path and os.path.isfile(self.schema_path):
            raw_schema = self.client.schema_from_json(self.schema_path)
            reconciled_schema = []
            schema_fields_map = {f.name: f for f in raw_schema}

            # Add missing schema columns to df as None
            for name, field in schema_fields_map.items():
                if name not in df_to_load.columns:
                    df_to_load[name] = None
                    reconciled_schema.append(
                        bigquery.SchemaField(
                            name=name,
                            field_type=field.field_type,
                            mode="NULLABLE",
                            description=field.description,
                        )
                    )
                else:
                    reconciled_schema.append(field)

            # Add extra columns from df to schema
            for col in df_to_load.columns:
                if col not in schema_fields_map:
                    reconciled_schema.append(
                        bigquery.SchemaField(
                            name=col,
                            field_type="STRING",
                            mode="NULLABLE",
                            description=f"Dynamically discovered column '{col}'",
                        )
                    )

            # Type-safe coercion
            for field in reconciled_schema:
                col = field.name
                f_type = field.field_type.upper()
                if col in df_to_load.columns:
                    if f_type in ("INTEGER", "INT64"):
                        df_to_load[col] = pd.to_numeric(df_to_load[col], errors="coerce").astype("Int64")
                    elif f_type in ("FLOAT", "FLOAT64", "NUMERIC", "BIGNUMERIC"):
                        df_to_load[col] = pd.to_numeric(df_to_load[col], errors="coerce")
                    elif f_type in ("TIMESTAMP", "DATETIME"):
                        df_to_load[col] = pd.to_datetime(df_to_load[col], errors="coerce", utc=True)
                    elif f_type == "STRING":
                        df_to_load[col] = df_to_load[col].apply(lambda v: str(v) if pd.notna(v) else None)

            job_config.schema = reconciled_schema
            logger.info("Applied reconciled BigQuery schema from %s (%d fields)", self.schema_path, len(reconciled_schema))
        else:
            job_config.autodetect = True

        logger.info("Executing BigQuery load job to %s with %d rows...", self.table_ref, len(df_to_load))
        try:
            load_job = self.client.load_table_from_dataframe(
                df_to_load, self.table_ref, job_config=job_config
            )
            load_job.result()
        except Exception as load_err:
            logger.critical("Load table job failed: %s", load_err, exc_info=True)
            raise load_err

        logger.info("Successfully loaded %d records into BigQuery table %s", len(df_to_load), self.table_ref)
        return len(df_to_load)
