CREATE TABLE IF NOT EXISTS `{project}.{dataset}.vishesh_postgres_test1` (
  `id` STRING NOT NULL,
  `data` STRING,
  `status` STRING,
  `created_at` TIMESTAMP,
  `_extracted_at` TIMESTAMP,
  `_pipeline_run_id` STRING
)
PARTITION BY DATE(`created_at`)
CLUSTER BY `id`, `status`;
