-- V1__init_schema.sql: Initial CitiDirect Cash Statement Schema

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS base_reports (
    id VARCHAR(36) PRIMARY KEY,
    report_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    default_parameters TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS report_criteria (
    id VARCHAR(36) PRIMARY KEY,
    base_report_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(50),
    customer_id VARCHAR(100),
    account_numbers TEXT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    date_preset VARCHAR(50),
    date_from DATE,
    date_to DATE,
    transaction_type VARCHAR(50) DEFAULT 'ALL',
    min_amount NUMERIC(18, 2),
    max_amount NUMERIC(18, 2),
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS report_schedules (
    id VARCHAR(36) PRIMARY KEY,
    criteria_id VARCHAR(36) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    execution_time_utc VARCHAR(20) NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS delivery_options (
    id VARCHAR(36) PRIMARY KEY,
    schedule_id VARCHAR(36),
    delivery_channel VARCHAR(50) NOT NULL,
    destination_config TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    maker_id VARCHAR(36) NOT NULL,
    checker_id VARCHAR(36),
    checker_comments TEXT,
    authorized_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS generated_reports (
    id VARCHAR(36) PRIMARY KEY,
    criteria_id VARCHAR(36),
    report_name VARCHAR(255) NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    file_size_bytes BIGINT,
    storage_path VARCHAR(500),
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    generated_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    client_ip VARCHAR(45) NOT NULL,
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMP NOT NULL
);
