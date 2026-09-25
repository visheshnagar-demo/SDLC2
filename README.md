# Cloud SQL PostgreSQL to BigQuery ETL Data Pipeline (SCRUM-396)

Production ETL pipeline extracting data from Google Cloud SQL PostgreSQL (`test_data`), performing data cleaning transformations, and loading into Google BigQuery (`analytics.vishesh_postgres_test1`).

## 1. Pipeline Overview
- **Source**: Cloud SQL PostgreSQL (`upbeat-repeater-477110-q6:us-central1:sdlc-etl-demo-db`, database: `postgres`, user: `559906504681-compute@developer`, table: `test_data`) via IAM Database Authentication.
- **Transformations**: Whitespace trimming, null standardization, record deduplication, UTC timestamp conversion, and audit metadata injection (`_extracted_at`, `_pipeline_run_id`).
- **Target**: BigQuery dataset `analytics`, table `vishesh_postgres_test1` in project `upbeat-repeater-477110-q6`.
- **Runtime**: Python 3.11 containerized batch job deployed on Google Cloud Run Job (Zero-Idle, Zero-Scheduler).

## 2. Directory Structure
```
├── dags/
│   └── postgres_to_bigquery_dag.py
├── pipeline/
│   ├── run_postgres_to_bigquery.py
│   └── postgres_to_bigquery_README.md
├── schemas/
│   └── vishesh_postgres_test1_schema.json
├── sql/
│   └── ddl/
│       └── vishesh_postgres_test1.sql
├── tests/
│   ├── __init__.py
│   └── test_postgres_to_bigquery_pipeline.py
├── transformation_spec.json
├── env.deploy.json
├── env.deploy.yaml
├── .env.example
├── Dockerfile
├── requirements.txt
└── README.md
```

## 3. Configuration & Environment Variables
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `INSTANCE_CONNECTION_NAME` | Cloud SQL instance connection name | `upbeat-repeater-477110-q6:us-central1:sdlc-etl-demo-db` |
| `POSTGRES_DB` | PostgreSQL database name | `postgres` |
| `POSTGRES_USER` | IAM Service Account database user | `559906504681-compute@developer` |
| `CLOUD_SQL_IP_TYPE` | Cloud SQL connection IP type | `PRIVATE` |
| `GCP_PROJECT_ID` | GCP Project ID | `upbeat-repeater-477110-q6` |
| `BIGQUERY_DATASET` | Target BigQuery dataset | `analytics` |
| `BIGQUERY_TABLE` | Target BigQuery table | `vishesh_postgres_test1` |

## 4. Local Execution & Testing
```bash
# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest tests/ -v

# Run ETL pipeline directly
python -m pipeline.run_postgres_to_bigquery
```
