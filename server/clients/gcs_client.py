"""Google Cloud Storage client wrapper."""
import os
import io
import pandas as pd
from google.cloud import storage
from server.utils.logger import get_logger

logger = get_logger("gcs_client")


class GCSClient:
    """Wrapper for GCS operations."""
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.client = storage.Client(project=project_id)

    def download_csv_to_dataframe(self, bucket_name: str, blob_prefix: str) -> pd.DataFrame:
        """Downloads and parses CSV files from GCS."""
        logger.info("Reading GCS bucket: %s, prefix: %s", bucket_name, blob_prefix)
        bucket = self.client.bucket(bucket_name)
        blobs = [b for b in bucket.list_blobs(prefix=blob_prefix) if not b.name.endswith("/")]
        if not blobs:
            raise FileNotFoundError(f"No files found in gs://{bucket_name}/{blob_prefix}")

        dfs = []
        for blob in blobs:
            content = blob.download_as_bytes()
            if not content:
                continue
            df = pd.read_csv(io.BytesIO(content))
            dfs.append(df)

        if not dfs:
            raise ValueError(f"All files in gs://{bucket_name}/{blob_prefix} were empty.")

        combined_df = pd.concat(dfs, ignore_index=True)
        return combined_df
