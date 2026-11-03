CREATE TABLE IF NOT EXISTS app_user (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    branch_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_criteria (
    id VARCHAR(36) PRIMARY KEY,
    created_by VARCHAR(36) NOT NULL,
    customer_id VARCHAR(50),
    branch_code VARCHAR(50),
    account_number VARCHAR(50),
    currency VARCHAR(10),
    date_matrix_type VARCHAR(50),
    statement_date VARCHAR(50),
    value_date VARCHAR(50),
    report_template_id VARCHAR(100),
    report_name VARCHAR(150),
    designated_owner VARCHAR(100),
    bank_reference VARCHAR(100),
    customer_reference VARCHAR(100),
    service_class_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_option (
    id VARCHAR(36) PRIMARY KEY,
    channel_type VARCHAR(50) NOT NULL,
    destination_target VARCHAR(255) NOT NULL,
    sftp_folder_path VARCHAR(255),
    encryption_protocol VARCHAR(50),
    ssh_key_method VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_AUTHORIZATION',
    maker_id VARCHAR(36) NOT NULL,
    checker_id VARCHAR(36),
    rejection_reason VARCHAR(500),
    checker_comments VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_schedule (
    id VARCHAR(36) PRIMARY KEY,
    criteria_id VARCHAR(36),
    delivery_option_id VARCHAR(36),
    schedule_name VARCHAR(150) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    cron_expression VARCHAR(100),
    start_date VARCHAR(50),
    start_time VARCHAR(50),
    intraday_hours INT DEFAULT 0,
    intraday_minutes INT DEFAULT 0,
    intraday_seconds INT DEFAULT 0,
    trigger_event VARCHAR(100),
    notify_emails VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_AUTHORIZATION',
    maker_id VARCHAR(36) NOT NULL,
    checker_id VARCHAR(36),
    rejection_reason VARCHAR(500),
    checker_comments VARCHAR(500),
    version INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS statement_report (
    id VARCHAR(36) PRIMARY KEY,
    criteria_id VARCHAR(36),
    report_name VARCHAR(150) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    branch_code VARCHAR(50),
    customer_id VARCHAR(50),
    account_number VARCHAR(50),
    currency VARCHAR(10),
    generation_status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    opening_balance NUMERIC(18,2) DEFAULT 0.00,
    closing_balance NUMERIC(18,2) DEFAULT 0.00,
    total_debits NUMERIC(18,2) DEFAULT 0.00,
    total_credits NUMERIC(18,2) DEFAULT 0.00,
    statement_date VARCHAR(50),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS statement_line_item (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL,
    txn_date VARCHAR(50),
    value_date VARCHAR(50),
    txn_reference VARCHAR(100),
    description VARCHAR(255),
    debit_amount NUMERIC(18,2) DEFAULT 0.00,
    credit_amount NUMERIC(18,2) DEFAULT 0.00,
    balance_after NUMERIC(18,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS audit_log_entry (
    id VARCHAR(36) PRIMARY KEY,
    actor_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(150),
    actor_role VARCHAR(50),
    action_type VARCHAR(50) NOT NULL,
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    payload_snapshot TEXT,
    checksum VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
