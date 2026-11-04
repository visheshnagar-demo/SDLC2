CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) PRIMARY KEY,
    account_number VARCHAR(32) NOT NULL UNIQUE,
    entity_id VARCHAR(64) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    branch_code VARCHAR(16) NOT NULL,
    account_name VARCHAR(128) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    value_date TIMESTAMP WITH TIME ZONE NOT NULL,
    transaction_type VARCHAR(16) NOT NULL,
    amount NUMERIC(18, 4) NOT NULL,
    running_balance NUMERIC(18, 4) NOT NULL,
    reference_number VARCHAR(64) NOT NULL,
    description VARCHAR(255) NOT NULL,
    cheque_number VARCHAR(32),
    CONSTRAINT fk_tx_account FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS report_schedules (
    id VARCHAR(36) PRIMARY KEY,
    schedule_name VARCHAR(128) NOT NULL,
    template_id VARCHAR(64) NOT NULL,
    criteria_json TEXT NOT NULL,
    frequency VARCHAR(16) NOT NULL,
    cron_expression VARCHAR(64) NOT NULL,
    export_format VARCHAR(10) NOT NULL,
    delivery_config TEXT NOT NULL,
    status VARCHAR(24) NOT NULL,
    created_by VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS maker_checker_requests (
    id VARCHAR(36) PRIMARY KEY,
    resource_type VARCHAR(32) NOT NULL,
    resource_id VARCHAR(36) NOT NULL,
    maker_id VARCHAR(64) NOT NULL,
    checker_id VARCHAR(64),
    status VARCHAR(24) NOT NULL,
    maker_comments TEXT,
    checker_comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(32) NOT NULL,
    target_resource VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    details_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
