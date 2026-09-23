CREATE TABLE IF NOT EXISTS `{project}.{dataset}.daily_sales` (
  `order_id` STRING NOT NULL,
  `order_date` DATE NOT NULL,
  `customer_id` STRING,
  `customer_name` STRING,
  `customer_email` STRING,
  `product_category` STRING,
  `amount` FLOAT64,
  `currency` STRING,
  `order_status` STRING,
  `created_at` TIMESTAMP,
  `ingested_at` TIMESTAMP NOT NULL
)
PARTITION BY DATE(`order_date`)
CLUSTER BY `customer_id`, `order_status`;
