CREATE TABLE IF NOT EXISTS `{project}.{dataset}.daily_sales` (
  `order_id` STRING NOT NULL,
  `customer_id` STRING NOT NULL,
  `customer_name` STRING,
  `customer_email` STRING,
  `product_category` STRING,
  `amount` FLOAT NOT NULL,
  `currency` STRING,
  `order_status` STRING,
  `created_at` TIMESTAMP,
  `order_date` DATE NOT NULL,
  `ingested_at` TIMESTAMP NOT NULL,
  `batch_id` STRING NOT NULL
)
PARTITION BY DATE(`order_date`)
CLUSTER BY `customer_id`, `order_status`;
