# Sales Order ETL Pipeline (SCRUM-391)

Production batch ETL data pipeline deployed as a **GCP Cloud Run Job** that extracts sales order data from Google Cloud Storage (`gs://sdlc-workspec-store/etl/data/raw_sales_data.csv`), cleans and deduplicates the records, and appends them into a day-partitioned BigQuery table (`analytics.vishesh-test1`).

---

## 1. Architecture Overview

- **Source**: Google Cloud Storage (`gs://sdlc-workspec-store/etl/data/raw_sales_data.csv`)
- **Transformation Engine**: Python 3.11 with Pandas / PyArrow (dynamic schema inference, type coercion, string normalization, deduplication by `order_id` keeping latest `created_at`)
- **Target Sink**: Google BigQuery (`analytics.vishesh-test1`), partitioned by `DATE(created_at)` and clustered by `customer_id`, `order_status`
- **Execution Runtime**: GCP Cloud Run Job (serverless, ephemeral container with exit code 0 on success / non-zero on failure)
- **Observability**: Structured JSON metric emission to Cloud Logging (`ETLPipelineMetrics`)

```
GCS (raw_sales_data.csv)
       │
       ▼
Cloud Run Job (Python 3.11 ETL)
  ├─ Ingestion & Schema Discovery
  ├─ Data Cleaning & Type Casting
  ├─ Deduplication (order_id + latest created_at)
  └─ Audit Timestamping (_ingestion_timestamp)
       │
       ▼
BigQuery Table (analytics.vishesh-test1)
  ├─ Day-Partitioned: DATE(created_at)
  └─ Clustered: customer_id, order_status
```

---

## 2. Directory Structure

```
├── Dockerfile                          # Production Python 3.11 batch container
├── README.md                           # Documentation
├── requirements.txt                    # Pipeline runtime dependencies
├── env.deploy.json                     # Environment configuration for deployment
├── transformation_spec.json            # Transformation specification
├── dags/
│   └── sales_order_etl_dag.py          # Reference Airflow / Cloud Composer DAG
├── schemas/
│   ├── sales_order_schema.json         # BigQuery table schema definition
│   └── vishesh-test1_schema.json       # Target table schema definition
├── sql/
│   └── ddl/
│       ├── vishesh-test1.sql           # Target table DDL with partition & cluster
│       └── vishesh_test1_ddl.sql       # DDL specification
├── src/
│   ├── __init__.py
│   ├── config.py                       # Configuration loader
│   ├── extractor.py                    # GCS CSV extractor
│   ├── models.py                       # Data models & observability metrics
│   ├── transformer.py                  # Cleaning, type casting, deduplication
│   ├── loader.py                       # BigQuery batch loader with schema reconciliation
│   └── main.py                         # Application entrypoint
├── pipeline/
│   └── run_sales_order_etl.py          # Standalone runner script
└── tests/
    ├── __init__.py
    ├── test_sales_etl.py               # Comprehensive unit and integration test suite
    └── test_sales_order_etl_pipeline.py# Automated pipeline tests
```

---

## 3. Environment Configuration

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GCS_SOURCE_URI` | GCS URI of the source sales CSV | `gs://sdlc-workspec-store/etl/data/raw_sales_data.csv` |
| `GCS_SOURCE_BUCKET` | Source bucket name | `sdlc-workspec-store` |
| `GCS_SOURCE_PREFIX` | Source object path | `etl/data/raw_sales_data.csv` |
| `GCP_PROJECT_ID` | Google Cloud Project ID | `upbeat-repeater-477110-q6` |
| `BIGQUERY_DATASET` | Target BigQuery dataset | `analytics` |
| `BIGQUERY_TABLE` | Target BigQuery table | `vishesh-test1` |
| `LOG_LEVEL` | Python logging level | `INFO` |

---

## 4. Local Execution & Testing

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Tests
```bash
pytest -v
```

### Run Local Pipeline Execution
```bash
python -m src.main
```

---

## 5. Cloud Run Job Execution

```bash
# Execute Cloud Run Job on GCP
gcloud run jobs execute sales-order-etl-job --region us-central1
```
