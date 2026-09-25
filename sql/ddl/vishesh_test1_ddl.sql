-- BigQuery DDL for partitioned analytics.vishesh-test1 table
CREATE TABLE IF NOT EXISTS `{project}.{dataset}.vishesh-test1` (
  `order_id` INT64 NOT NULL,
  `customer_id` STRING,
  `customer_name` STRING,
  `customer_email` STRING,
  `product_category` STRING,
  `amount` FLOAT64,
  `currency` STRING,
  `order_status` STRING,
  `created_at` TIMESTAMP,
  `_ingestion_timestamp` TIMESTAMP
)
PARTITION BY DATE(`created_at`)
CLUSTER BY `customer_id`, `order_status`
OPTIONS(
  description="Sales orders extracted from GCS, cleansed, deduplicated and partitioned by order date"
);
