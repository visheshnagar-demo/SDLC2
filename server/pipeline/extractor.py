"""Sales order extractor module."""
import pandas as pd
from server.clients.gcs_client import GCSClient
from server.utils.logger import get_logger

logger = get_logger("extractor")


def extract_sales_data(bucket_name: str, blob_prefix: str, gcs_client: GCSClient) -> pd.DataFrame:
    """Extracts raw sales CSV data from GCS with schema-on-read validation."""
    logger.info("Extracting sales data from gs://%s/%s", bucket_name, blob_prefix)
    df = gcs_client.download_csv_to_dataframe(bucket_name=bucket_name, blob_prefix=blob_prefix)
    
    if df.empty:
        raise ValueError("Extracted dataset is empty.")
        
    logger.info("Successfully extracted %d raw records. Columns: %s", len(df), list(df.columns))
    return df
