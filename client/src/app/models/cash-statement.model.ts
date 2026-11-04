export interface Account {
  id: string;
  account_number: string;
  entity_id: string;
  currency: string;
  branch_code: string;
  account_name: string;
  is_active: boolean;
}

export interface ReportTemplate {
  template_id: string;
  report_name: string;
  classification: string;
  description: string;
  category: string;
}

export interface StatementGenerateRequest {
  account_numbers?: string[];
  currency?: string;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  statement_type?: string;
  page?: number;
  size?: number;
}

export interface TransactionRecord {
  transaction_id: string;
  account_number: string;
  value_date: string;
  booking_date: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  reference_number: string;
  description: string;
  cheque_number?: string;
}

export interface StatementGenerateResponse {
  statement_id: string;
  entity_name: string;
  currency: string;
  opening_balance: number;
  closing_balance: number;
  total_debits: number;
  total_credits: number;
  total_records: number;
  records: TransactionRecord[];
}

export interface ExportRequest {
  statement_id?: string;
  account_numbers?: string[];
  currency?: string;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  statement_type?: string;
  export_format?: 'PDF' | 'EXCEL' | 'CSV' | 'XLSX';
  template_id?: string;
}

export interface ScheduleDTO {
  id?: string;
  schedule_name: string;
  template_id: string;
  criteria: Record<string, any>;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'INTRADAY';
  cron_expression: string;
  export_format: 'PDF' | 'EXCEL' | 'CSV';
  delivery_options: {
    channel: 'EMAIL' | 'SFTP';
    email_recipients?: string[];
    sftp_host?: string;
    sftp_path?: string;
  };
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MakerCheckerRequest {
  id: string;
  resource_type: string;
  resource_id: string;
  maker_id: string;
  checker_id?: string;
  status: 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  maker_comments?: string;
  checker_comments?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  target_resource: string;
  ip_address: string;
  user_agent?: string;
  details_json: string;
  created_at: string;
}
