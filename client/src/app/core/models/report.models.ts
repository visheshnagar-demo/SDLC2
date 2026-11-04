export interface BaseReport {
  id: string;
  reportCode: string;
  name: string;
  formatStandard: string;
  category: string;
  defaultFrequency: string;
  description?: string;
}

export interface ReportCriteria {
  id?: string;
  baseReportId: string;
  name: string;
  branchCode: string;
  customerId?: string;
  accountNumbers: string[];
  currency: string;
  datePreset?: string;
  dateFrom?: string;
  dateTo?: string;
  transactionType: 'ALL' | 'CREDIT' | 'DEBIT';
  minAmount?: number;
  maxAmount?: number;
  exportFormat: 'PDF' | 'EXCEL' | 'CSV' | 'SWIFT_MT940';
  includeOpeningClosing?: boolean;
  trailingNegative?: boolean;
  appendCryptoSignature?: boolean;
  suppressZeroBalance?: boolean;
  status?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ReportSchedule {
  id?: string;
  criteriaId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  cronExpression?: string;
  executionTimeUtc: string;
  activeDays?: string[];
  timezone?: string;
  exportFormat: string;
  deliveryChannels?: string[];
  effectiveStartDate?: string;
  expiryOption?: 'INDEFINITE' | 'EXECUTIONS' | 'SPECIFIC_DATE';
  holidayHandling?: string;
  failoverPolicy?: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'PAUSED' | 'REVOKED';
  createdBy?: string;
  createdAt?: string;
}

export interface DeliveryOption {
  id?: string;
  scheduleId?: string;
  deliveryChannel: 'SFTP' | 'EMAIL' | 'PORTAL';
  destinationConfig: {
    host?: string;
    port?: number;
    remotePath?: string;
    authScheme?: string;
    pgpEncryption?: boolean;
    pgpKeyId?: string;
    emailRecipients?: string[];
    [key: string]: any;
  };
  status: 'PENDING_APPROVAL' | 'AUTHORIZED' | 'REJECTED';
  makerId?: string;
  makerName?: string;
  checkerId?: string;
  checkerName?: string;
  checkerComments?: string;
  authorizedAt?: string;
  createdAt?: string;
}

export interface GeneratedReport {
  id: string;
  criteriaId?: string;
  reportName: string;
  accountNumbers?: string[];
  branchCode?: string;
  frequency?: string;
  exportFormat: string;
  fileSizeBytes?: number;
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'GENERATING' | 'REJECTED' | 'FAILED';
  errorMessage?: string;
  createdBy?: string;
  createdAt: string;
}

export interface LookupBranch {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface LookupCustomer {
  id: string;
  name: string;
  taxId: string;
}

export interface LookupAccount {
  accountNumber: string;
  accountName: string;
  currency: string;
  branchCode: string;
  balance: number;
}
