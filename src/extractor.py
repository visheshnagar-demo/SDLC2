"""GCS CSV Extractor module."""
import io
import os
import logging
import pandas as pd
from google.cloud import storage

logger = logging.getLogger(__name__)


class GCSExtractor:
    """Extracts raw CSV files from Google Cloud Storage."""

    def __init__(self, uri: str = None, bucket: str = None, prefix: str = None):
        if uri and uri.startswith("gs://"):
            parts = uri[5:].split("/", 1)
            self.bucket_name = parts[0]
            self.prefix = parts[1] if len(parts) > 1 else ""
        else:
            self.bucket_name = bucket or os.getenv("GCS_SOURCE_BUCKET", "sdlc-workspec-store")
            self.prefix = prefix or os.getenv("GCS_SOURCE_PREFIX", "etl/data/raw_sales_data.csv")

    def extract(self) -> pd.DataFrame:
        """Extracts CSV data from GCS and returns a pandas DataFrame.

        Raises:
            EnvironmentError: If GCS bucket is not configured.
            FileNotFoundError: If the source blob does not exist or has 0 bytes.
            RuntimeError: If download or parsing fails.
        """
        if not self.bucket_name:
            raise EnvironmentError("FATAL: GCS source bucket not specified.")

        logger.info("Connecting to GCS bucket: %s, prefix: %s", self.bucket_name, self.prefix)
        client = storage.Client()
        bucket = client.bucket(self.bucket_name)

        blob = bucket.blob(self.prefix)
        if not blob.exists():
            # Check if prefix matches multiple blobs
            blobs = [b for b in bucket.list_blobs(prefix=self.prefix) if not b.name.endswith("/")]
            if not blobs:
                raise FileNotFoundError(
                    f"FATAL: Source file or objects not found at gs://{self.bucket_name}/{self.prefix}"
                )
            dfs = []
            for b in blobs:
                data = b.download_as_bytes()
                if len(data) > 0:
                    dfs.append(pd.read_csv(io.BytesIO(data)))
            if not dfs:
                raise FileNotFoundError(f"FATAL: All blobs under gs://{self.bucket_name}/{self.prefix} are empty.")
            df = pd.concat(dfs, ignore_index=True)
            logger.info("Successfully extracted %d records from %d blobs in GCS", len(df), len(blobs))
            return df

        content_bytes = blob.download_as_bytes()
        if len(content_bytes) == 0:
            raise FileNotFoundError(
                f"FATAL: Source file gs://{self.bucket_name}/{self.prefix} is 0 bytes (empty)."
            )

        df = pd.read_csv(io.BytesIO(content_bytes))
        logger.info("Successfully extracted %d rows from gs://%s/%s", len(df), self.bucket_name, self.prefix)
        return df
