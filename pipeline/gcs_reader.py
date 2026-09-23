"""GCS Source Ingestion Module for Sales Order Data Pipeline."""
import os
import logging
import pandas as pd
from google.cloud import storage

logger = logging.getLogger(__name__)


def extract_gcs_data(
    bucket_name: str,
    prefix_or_file: str,
    local_staging_dir: str = "staging/raw",
) -> pd.DataFrame:
    """Extracts raw sales CSV data from Google Cloud Storage into a Pandas DataFrame.

    Zero-Mock Policy: Executes real extraction using GCP Storage Client.
    Fails fast if credentials, bucket, or files are not available.
    """
    if not bucket_name:
        raise EnvironmentError("FATAL: GCS source bucket name is required (e.g. GCS_SOURCE_BUCKET).")

    logger.info("Extracting data from GCS bucket: gs://%s/%s", bucket_name, prefix_or_file)
    client = storage.Client()
    bucket = client.bucket(bucket_name)

    # Check if direct blob exists
    blob = bucket.blob(prefix_or_file)
    blobs_to_process = []
    if blob.exists():
        blobs_to_process.append(blob)
    else:
        blobs_to_process = [
            b for b in bucket.list_blobs(prefix=prefix_or_file)
            if not b.name.endswith("/")
        ]

    if not blobs_to_process:
        raise FileNotFoundError(
            f"FATAL: No data files found in gs://{bucket_name}/{prefix_or_file}. Mock fallback disabled."
        )

    os.makedirs(local_staging_dir, exist_ok=True)
    dfs = []
    for b in blobs_to_process:
        local_file_path = os.path.join(local_staging_dir, os.path.basename(b.name))
        logger.info("Downloading gs://%s/%s to %s", bucket_name, b.name, local_file_path)
        b.download_to_filename(local_file_path)

        if local_file_path.endswith(".csv"):
            df = pd.read_csv(local_file_path)
            dfs.append(df)
        elif local_file_path.endswith(".parquet"):
            df = pd.read_parquet(local_file_path)
            dfs.append(df)
        elif local_file_path.endswith(".json") or local_file_path.endswith(".jsonl"):
            df = pd.read_json(local_file_path, lines=True)
            dfs.append(df)

    if not dfs:
        raise FileNotFoundError(f"FATAL: No parseable records extracted from gs://{bucket_name}/{prefix_or_file}")

    combined_df = pd.concat(dfs, ignore_index=True)
    logger.info("Successfully extracted %d records from GCS source.", len(combined_df))
    return combined_df
