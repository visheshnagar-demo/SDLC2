CREATE TABLE IF NOT EXISTS `{project}.{dataset}.vishesh-test1` (
  `order_id` INTEGER NOT NULL,
  `customer_id` STRING,
  `customer_name` STRING,
  `customer_email` STRING,
  `product_category` STRING,
  `amount` FLOAT,
  `currency` STRING,
  `order_status` STRING,
  `created_at` TIMESTAMP,
  `_ingestion_timestamp` TIMESTAMP
)
PARTITION BY DATE(`created_at`)
CLUSTER BY `customer_id`, `order_status`;
