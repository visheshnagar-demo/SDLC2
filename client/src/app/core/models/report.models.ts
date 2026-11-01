export interface BaseReport {
  id: string;
  reportName: string;
  baseReportName: string;
  isBase: boolean;
  category: string;
  reportType: string;
  isFavorite?: boolean;
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
  accountSelectionType: 'ACCOUNT' | 'ACCOUNT_GROUP';
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
  customerReference: string;
  bankReference: string;
  description: string;
  orderingPartyName: string;
  beneficiaryName: string;
  remittanceInformation?: string;
  debitCredit: 'C' | 'D';
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
  creditCount: number;
  totalCreditAmount: number;
  debitCount: number;
  totalDebitAmount: number;
  netTransactionAmount: number;
  branchSupportsRunningBalance: boolean;
  transactions: TransactionRecord[];
}

export interface ExecutionJob {
  id: string;
  jobId: string;
  reportName: string;
  format: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  requestedAt: string;
  completedAt?: string;
  recordCount?: number;
  downloadUrl?: string;
  errorMessage?: string;
}
