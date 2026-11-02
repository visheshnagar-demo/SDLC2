export interface BaseReport {
  id: string;
  reportName: string;
  baseReportName: string;
  isBase: boolean;
  category: string;
  reportType: string;
  isFavorite?: boolean;
}

export interface CriteriaPayload {
  branchNumber?: string;
  customerNumber?: string;
  accountSelectionType?: string;
  accountNumber?: string;
  accountGroup?: string;
  bankReference?: string;
  bankReferenceOperator?: string;
  customerReference?: string;
  customerReferenceOperator?: string;
  amountFrom?: number | null;
  amountTo?: number | null;
  accountCurrency?: string;
  transactionDescription?: string;
  transactionDescriptionOperator?: string;
  byOrderBeneficiary?: string;
  transactionCode?: string;
  cheques?: string;
  baseCurrency?: string;
  showEnhancedTransactionDetails?: boolean;
  outputAccountSubTotals?: boolean;
  outputGrandTotal?: boolean;
  showAdditionalOrderingPartyDetails?: boolean;
  statementDateRadio?: string;
  statementDateFrom?: string;
  statementDateTo?: string;
  valueDateRadio?: string;
  valueDateFrom?: string;
  valueDateTo?: string;
  pageBreaks?: boolean;
  printChinaStamp?: boolean;
  activityOnly?: boolean;
  runInIncrementalMode?: boolean;
  printSelectionCriteria?: boolean;
  signWithCertificate?: boolean;
  compressWithWinzip?: boolean;
  csvSeparator?: string;
  dateFormat?: string;
}

export interface DerivedReportRequest {
  derivedReportName: string;
  baseReportName?: string;
  format?: string;
  deliveryOptionId?: string;
  designatedOwner?: string;
  share?: string;
  favorite?: boolean;
  criteria: CriteriaPayload;
}

export interface DerivedReportResponse {
  id: string;
  derivedReportName: string;
  baseReportName: string;
  ownerUsername: string;
  format: string;
  sharedPublic: boolean;
  favorite: boolean;
  deliveryOptionId?: string;
  criteria: CriteriaPayload;
  createdAt: string;
  updatedAt: string;
}

export interface DefaultCriteriaResponse {
  baseReportName: string;
  derivedReportName: string;
  format: string;
  signWithCertificate: boolean;
  compressWithWinzip: boolean;
  designatedOwner: string;
  share: string;
  favorite: boolean;
  accountSelectionType: string;
  transactionCode: string;
  cheques: string;
  baseCurrency: string;
  showEnhancedTransactionDetails: boolean;
  outputAccountSubTotals: boolean;
  outputGrandTotal: boolean;
  showAdditionalOrderingPartyDetails: boolean;
  statementDateRadio: string;
  valueDateRadio: string;
  pageBreaks: boolean;
  printChinaStamp: boolean;
  activityOnly: boolean;
  runInIncrementalMode: boolean;
  printSelectionCriteria: boolean;
  criteriaPayload?: CriteriaPayload;
}

export interface ReportCriteria {
  id?: string;
  derivedReportName: string;
  baseReportName: string;
  format: string;
  signWithCertificate: boolean;
  compressWithWinzip: boolean;
  deliveryOptionId?: string;
  deliveryOptionName?: string;
  designatedOwner: string;
  share: 'PRIVATE' | 'PUBLIC';
  favorite: boolean;

  // Specific Field Details
  branchNumberName?: string;
  customerNumberName?: string;
  accountSelectionType: 'ACCOUNT' | 'ACCOUNT_GROUP' | string;
  accountNumberName?: string;
  bankReferenceOperator?: string;
  bankReferenceValue?: string;
  customerReferenceOperator?: string;
  customerReferenceValue?: string;
  transactionAmountFrom?: number | null;
  transactionAmountTo?: number | null;
  accountCurrency?: string;
  transactionDescriptionOperator?: string;
  transactionDescriptionValue?: string;
  byOrderBeneficiary?: string;
  transactionCode: string;
  cheques: string;
  baseCurrency: string;

  // Display options
  showEnhancedTransactionDetails: boolean;
  outputAccountSubTotals: boolean;
  outputGrandTotal: boolean;
  showAdditionalOrderingPartyBeneficiary: boolean;

  // Date Radios
  statementDateRadio: string;
  statementDateFrom?: string;
  statementDateTo?: string;
  valueDateRadio: string;
  valueDateFrom?: string;
  valueDateTo?: string;

  // Output control checkboxes
  pageBreaks: boolean;
  printCitibankChinaStamp: boolean;
  activityOnly: boolean;
  runInIncrementalMode: boolean;
  printSelectionCriteria: boolean;
}

export interface TransactionRecord {
  id: string;
  valueDate: string;
  statementDate?: string;
  customerReference: string;
  bankReference: string;
  description: string;
  orderingPartyName: string;
  beneficiaryName: string;
  remittanceInformation?: string;
  debitCredit: 'C' | 'D' | string;
  amount: number;
  runningBalance: number;
  productType?: string;
  entryDate?: string;
  batchTrackNumber?: string;
  paymentDetails?: string;
  originatingBank?: string;
  bankClearingId?: string;
  beneficiaryBank?: string;
  byOrderOf?: string;
  addressLines?: string[];
}

export interface StatementReportData {
  bankName: string;
  customerNumberName: string;
  branchNumberName: string;
  swiftCode: string;
  accountNumberName: string;
  currency: string;
  accountType: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  intradayBalance?: number;
  creditCount: number;
  totalCreditAmount: number;
  debitCount: number;
  totalDebitAmount: number;
  netTransactionAmount: number;
  branchSupportsRunningBalance: boolean;
  transactions: TransactionRecord[];
  accounts?: any[];
}

export interface RunReportRequest {
  derivedReportId?: string;
  reportName?: string;
  overrideFormat?: string;
  criteria?: CriteriaPayload;
}

export interface ExecutionJob {
  id: string;
  jobId?: string;
  reportName: string;
  format: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;
  requestedAt?: string;
  executionTimeGmt?: string;
  completedAt?: string;
  recordCount?: number;
  recordsCount?: number;
  downloadUrl?: string;
  fileName?: string;
  errorMessage?: string;
}

export interface ExecutionResponse {
  id: string;
  jobId?: string;
  derivedReportId?: string;
  reportName: string;
  executedByUserId?: string;
  executionTimeGmt: string;
  requestedAt?: string;
  format: string;
  status: string;
  fileName: string;
  recordsCount: number;
  recordCount?: number;
  downloadUrl: string;
}
