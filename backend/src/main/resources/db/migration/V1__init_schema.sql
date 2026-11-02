-- V1: Initial Schema for CitiDirect Cash Statements

CREATE TABLE IF NOT EXISTS branches (
    branch_number VARCHAR(10) PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    swift_code VARCHAR(20) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    running_balance_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    customer_number VARCHAR(20) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    account_number VARCHAR(34) PRIMARY KEY,
    account_name VARCHAR(100) NOT NULL,
    customer_number VARCHAR(20) NOT NULL REFERENCES customers(customer_number),
    branch_number VARCHAR(10) NOT NULL REFERENCES branches(branch_number),
    currency VARCHAR(3) NOT NULL,
    account_type VARCHAR(30) NOT NULL DEFAULT 'CHECKING',
    opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    account_number VARCHAR(34) NOT NULL REFERENCES accounts(account_number),
    value_date DATE NOT NULL,
    statement_date DATE NOT NULL,
    customer_reference VARCHAR(50),
    bank_reference VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    debit_credit VARCHAR(1) NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    running_balance NUMERIC(18,2) NOT NULL,
    ordering_party_name VARCHAR(150),
    ordering_party_account VARCHAR(34),
    ordering_party_address1 VARCHAR(100),
    ordering_party_address2 VARCHAR(100),
    ordering_bank VARCHAR(100),
    beneficiary_name VARCHAR(150),
    beneficiary_account VARCHAR(34),
    beneficiary_bank VARCHAR(100),
    remittance_information VARCHAR(255),
    transaction_code VARCHAR(20) NOT NULL DEFAULT 'CITI001',
    product_type VARCHAR(50),
    batch_number VARCHAR(50),
    cheque_number VARCHAR(50),
    enhanced_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_entitlements (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES app_users(id),
    entity_type VARCHAR(30) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_options (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL DEFAULT 'E-MAIL',
    security_method VARCHAR(50) NOT NULL DEFAULT 'Citi Secure E-Mail',
    email_recipients TEXT NOT NULL,
    email_subject VARCHAR(200) NOT NULL,
    email_message TEXT,
    file_name VARCHAR(100) NOT NULL,
    auth_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_AUTHORIZATION',
    maker_id VARCHAR(36) NOT NULL REFERENCES app_users(id),
    checker_id VARCHAR(36) REFERENCES app_users(id),
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS derived_reports (
    id VARCHAR(36) PRIMARY KEY,
    derived_report_name VARCHAR(100) NOT NULL UNIQUE,
    base_report_name VARCHAR(100) NOT NULL DEFAULT 'Account Statement – Comprehensive',
    owner_username VARCHAR(50) NOT NULL,
    format VARCHAR(50) NOT NULL,
    is_shared_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_option_id VARCHAR(36) REFERENCES delivery_options(id),
    criteria_payload TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_schedules (
    id VARCHAR(36) PRIMARY KEY,
    schedule_reference_id VARCHAR(30) NOT NULL UNIQUE,
    schedule_name VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(30) NOT NULL DEFAULT 'Report',
    event_name VARCHAR(100) NOT NULL,
    derived_report_id VARCHAR(36) NOT NULL REFERENCES derived_reports(id),
    delivery_option_id VARCHAR(36) NOT NULL REFERENCES delivery_options(id),
    interval_type VARCHAR(30) NOT NULL,
    interval_config TEXT NOT NULL,
    holiday_option VARCHAR(30) NOT NULL DEFAULT 'RUN_ALL_DAYS',
    run_time_user VARCHAR(50),
    auth_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_AUTHORIZATION',
    maker_id VARCHAR(36) NOT NULL REFERENCES app_users(id),
    checker_id VARCHAR(36) REFERENCES app_users(id),
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_history (
    id VARCHAR(36) PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL REFERENCES report_schedules(id),
    execution_time_gmt TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) NOT NULL,
    records_processed INT NOT NULL DEFAULT 0,
    error_details TEXT,
    recipients VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_executions (
    id VARCHAR(36) PRIMARY KEY,
    derived_report_id VARCHAR(36) REFERENCES derived_reports(id),
    report_name VARCHAR(100) NOT NULL,
    executed_by_user_id VARCHAR(36) NOT NULL REFERENCES app_users(id),
    execution_time_gmt TIMESTAMP WITH TIME ZONE NOT NULL,
    format VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    file_name VARCHAR(255),
    records_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_trail (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details TEXT,
    timestamp_gmt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
