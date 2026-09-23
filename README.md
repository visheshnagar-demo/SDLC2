# ETL Sales Order Pipeline (`SCRUM-360`)

Production-grade ETL data pipeline packaged as a serverless Google Cloud Run Job that extracts sales order data from Google Cloud Storage, performs data cleansing and deduplication, and loads the validated dataset into the partitioned BigQuery table `analytics.daily_sales`.

---

## 1. Pipeline Overview
- **Source**: Google Cloud Storage (`gs://sdlc-workspec-store/etl/data/raw_sales_data.csv`)
- **Target Sink**: Google BigQuery (`analytics.daily_sales`)
- **Partitioning**: DAY partitioning on `order_date`
- **Clustering**: `customer_id`, `order_status`
- **Deduplication**: Resolves duplicates on business key `order_id` (keeps latest record)
- **Runtime Model**: Serverless batch Cloud Run Job (zero idle cost, zero background schedulers)

---

## 2. Directory Structure
```
├── dags/
│   └── daily_sales_dag.py
├── pipeline/
│   ├── __init__.py
│   ├── gcs_reader.py
│   ├── transformer.py
│   ├── bq_loader.py
│   └── run_daily_sales.py
├── schemas/
│   └── daily_sales_schema.json
├── sql/
│   └── ddl/
│       └── daily_sales.sql
├── tests/
│   ├── __init__.py
│   ├── test_etl.py
│   └── test_daily_sales_pipeline.py
├── Dockerfile
├── requirements.txt
├── env.deploy.json
├── transformation_spec.json
└── README.md
```

---

## 3. Transformations & Data Quality
1. **Schema Standardization**: Column names standardized to snake_case.
2. **Missing & Empty Value Handling**: Rows missing primary business key (`order_id`) or with 100% null values are quarantined.
3. **Data Type Coercion**:
   - `amount`: Cleans currency symbols/whitespace and casts to `FLOAT64`.
   - `created_at`: Parses ISO-8601 timestamps to UTC `TIMESTAMP`.
   - `order_date`: Derived from `created_at.date` as `DATE`.
   - `ingested_at`: UTC timestamp injected at load time.
4. **Deduplication**: Deterministic deduplication on `order_id` keeping the latest transaction record.
5. **Fail-Fast & Zero-Mock Guarantee**: Queries real GCP sources; raises explicit errors on missing sources or schema contract violations.

---

## 4. Local Development & Testing

### Prerequisites
- Python 3.11+
- Google Cloud SDK (authenticated)

### Run Tests
```bash
pytest tests/ -v
```

### Run Pipeline Standalone
```bash
python main.py
```

---

## 5. Cloud Run Job Deployment

The container is built and deployed as a Cloud Run Job:

```bash
# Build image
docker build -t gcr.io/upbeat-repeater-477110-q6/etl-sales-pipeline:latest .

# Execute job
gcloud run jobs execute etl-sales-pipeline --region=us-central1
```
