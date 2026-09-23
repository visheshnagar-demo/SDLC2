# Sales ETL Data Pipeline (Cloud Run Job)

**Jira Issue:** SCRUM-357  
**GCP Project:** `upbeat-repeater-477110-q6`  
**Architecture:** Google Cloud Storage -> Python ETL (Cloud Run Job) -> Google BigQuery (`analytics.daily_sales`)  

---

## 1. Overview
This production-grade ETL data pipeline ingests sales order CSV transactions from Google Cloud Storage (`gs://sdlc-workspec-store/etl/data/raw_sales_data.csv`), performs schema-on-read validation, field sanitization, deduplication on `order_id`, and loads partitioned daily records into Google BigQuery table `analytics.daily_sales`.

The workload is containerized as an ephemeral, serverless **Cloud Run Job** with zero scheduler idle costs and deterministic exit codes (`0` for success, `1` for fatal errors).

---

## 2. Directory Structure

```
├── Dockerfile                          # Cloud Run Job container definition
├── requirements.txt                    # Project dependencies
├── env.deploy.json                     # Environment configuration for deployment
├── transformation_spec.json            # Target schema and transformation mapping
├── README.md                           # Documentation
├── server/                             # Modular ETL engine package
│   ├── __init__.py
│   ├── main.py                         # Main Cloud Run Job entry point
│   ├── config.py                       # Configuration loader
│   ├── clients/
│   │   ├── __init__.py
│   │   ├── gcs_client.py               # GCS storage client wrapper
│   │   └── bq_client.py                # BigQuery partitioned load client
│   ├── pipeline/
│   │   ├── __init__.py
│   │   ├── extractor.py                # GCS CSV extractor
│   │   ├── validator.py                # Schema validation & circuit breaker
│   │   ├── transformer.py              # Data cleaning & order_id deduplication
│   │   └── loader.py                   # BigQuery dispatcher
│   ├── schemas/
│   │   └── daily_sales_schema.json     # BigQuery table schema
│   ├── sql/ddl/
│   │   └── daily_sales.sql             # BigQuery DDL
│   ├── utils/
│   │   ├── __init__.py
│   │   └── logger.py                   # Structured JSON logger & telemetry
│   └── tests/
│       ├── __init__.py
│       └── test_sales_etl.py           # Unit & pipeline test suite
├── schemas/
│   └── daily_sales_schema.json
├── sql/ddl/
│   └── daily_sales.sql
└── tests/
    └── test_sales_etl_pipeline.py
```

---

## 3. Data Schema & Partitioning
- **Target Table:** `analytics.daily_sales`
- **Partitioning Field:** `order_date` (DAY partitioning)
- **Clustering Fields:** `customer_id`, `order_status`

| Column | Type | Mode | Description |
|---|---|---|---|
| `order_id` | `STRING` | REQUIRED | Unique sales order business identifier |
| `customer_id` | `STRING` | REQUIRED | Identifier of purchasing customer |
| `customer_name` | `STRING` | NULLABLE | Customer full name |
| `customer_email` | `STRING` | NULLABLE | Normalized customer email address |
| `product_category`| `STRING` | NULLABLE | Product category |
| `amount` | `FLOAT` | REQUIRED | Total transaction amount |
| `currency` | `STRING` | NULLABLE | Currency code (e.g. USD) |
| `order_status` | `STRING` | NULLABLE | Status of the order |
| `created_at` | `TIMESTAMP`| NULLABLE | Order timestamp |
| `order_date` | `DATE` | REQUIRED | Day partition key derived from `created_at` |
| `ingested_at` | `TIMESTAMP`| REQUIRED | Load timestamp |
| `batch_id` | `STRING` | REQUIRED | Cloud Run Job execution UUID |

---

## 4. Local Testing & Execution

### Running Tests
```bash
pytest server/tests/ tests/ -v
```

### Running Pipeline Locally
```bash
export GCP_PROJECT_ID="upbeat-repeater-477110-q6"
export GCS_SOURCE_URI="gs://sdlc-workspec-store/etl/data/raw_sales_data.csv"
export BQ_DATASET="analytics"
export BQ_TABLE="daily_sales"

python -m server.main
```
