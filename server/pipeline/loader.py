"""BigQuery load dispatcher."""
import os
import pandas as pd
from server.clients.bq_client import BigQueryClient
from server.config import Config
from server.utils.logger import get_logger

logger = get_logger("loader")


def load_sales_data(df: pd.DataFrame, bq_client: BigQueryClient, config: Config) -> int:
    """Dispatches loaded data to partitioned BigQuery table."""
    logger.info("Dispatching %d rows to BigQuery table: %s.%s", len(df), config.BQ_DATASET, config.BQ_TABLE)
    
    schema_path = os.path.join(os.path.dirname(__file__), "..", "schemas", "daily_sales_schema.json")
    if not os.path.exists(schema_path):
        schema_path = os.path.join("schemas", "daily_sales_schema.json")

    rows_loaded = bq_client.load_dataframe_to_table(
        df=df,
        dataset_id=config.BQ_DATASET,
        table_id=config.BQ_TABLE,
        partition_field="order_date",
        clustering_fields=["customer_id", "order_status"],
        schema_path=schema_path if os.path.exists(schema_path) else None
    )
    return rows_loaded
