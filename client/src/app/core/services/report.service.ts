import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { BaseReport, ReportCriteria, StatementReportData, ExecutionJob } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private api: ApiService) {}

  getBaseReports(): Observable<BaseReport[]> {
    return this.api.get<BaseReport[]>('/api/v1/reports/base').pipe(
      catchError(() => of(this.getMockBaseReports()))
    );
  }

  getCriteriaDefaults(): Observable<ReportCriteria> {
    return this.api.get<ReportCriteria>('/api/v1/reports/criteria/defaults').pipe(
      catchError(() => of(this.getMockCriteriaDefaults()))
    );
  }

  getCriteriaById(id: string): Observable<ReportCriteria> {
    return this.api.get<ReportCriteria>(`/api/v1/reports/criteria/${id}`).pipe(
      catchError(() => of({ ...this.getMockCriteriaDefaults(), id, derivedReportName: 'Account Statement – Comprehensive (Saved)' }))
    );
  }

  saveCriteria(criteria: ReportCriteria): Observable<{ id: string; message: string }> {
    return this.api.post<{ id: string; message: string }>('/api/v1/reports/criteria', criteria).pipe(
      catchError(() => of({ id: criteria.id || 'CRIT-' + Date.now(), message: 'Criteria saved successfully (Local/Mock)' }))
    );
  }

  runReport(criteria: ReportCriteria, overrideFormat?: string): Observable<StatementReportData> {
    return this.api.post<StatementReportData>('/api/v1/reports/execution/run', {
      criteria,
      format: overrideFormat || criteria.format
    }).pipe(
      catchError(() => of(this.getMockStatementData(criteria)))
    );
  }

  getMyReports(): Observable<ExecutionJob[]> {
    return this.api.get<ExecutionJob[]>('/api/v1/reports/my-reports').pipe(
      catchError(() => of(this.getMockExecutionJobs()))
    );
  }

  exportReportFile(criteria: ReportCriteria, format: string): Observable<Blob> {
    return this.api.downloadFile('/api/v1/reports/execution/export', {
      criteria,
      format
    }).pipe(
      catchError(() => {
        const dummyText = `CITIDIRECT - Account Statement Comprehensive Report\nDate: 22/01/2022\nFormat: ${format}\nAccount: XX12CITI11223344446677\nTotal Credits: 321,267.67\nTotal Debits: 292,017.85`;
        return of(new Blob([dummyText], { type: 'text/plain' }));
      })
    );
  }

  getMockCriteriaDefaults(): ReportCriteria {
    return {
      derivedReportName: '',
      baseReportName: 'Account Statement – Comprehensive',
      format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      signWithCertificate: false,
      compressWithWinzip: false,
      deliveryOptionId: '',
      deliveryOptionName: '',
      designatedOwner: 'JUSTIN,JOHN',
      share: 'PRIVATE',
      favorite: false,
      branchNumberName: '600 - A BRANCH NAME',
      customerNumberName: '0000244654 - A CUSTOMER NAME',
      accountSelectionType: 'ACCOUNT',
      accountNumberName: 'XX12CITI11223344446677 - AN ACCOUNT NAME',
      bankReferenceOperator: 'Equals',
      bankReferenceValue: '',
      customerReferenceOperator: 'Equals',
      customerReferenceValue: '',
      transactionAmountFrom: null,
      transactionAmountTo: null,
      accountCurrency: 'GBP',
      transactionDescriptionOperator: 'Equals',
      transactionDescriptionValue: '',
      byOrderBeneficiary: '',
      transactionCode: 'Citi Transaction Codes',
      cheques: 'Include Cheques',
      baseCurrency: 'USD',
      showEnhancedTransactionDetails: false,
      outputAccountSubTotals: false,
      outputGrandTotal: false,
      showAdditionalOrderingPartyBeneficiary: false,
      statementDateRadio: 'Yesterday',
      valueDateRadio: 'No Date Selected',
      pageBreaks: true,
      printCitibankChinaStamp: false,
      activityOnly: false,
      runInIncrementalMode: false,
      printSelectionCriteria: true
    };
  }

  getMockBaseReports(): BaseReport[] {
    return [
      { id: '1', reportName: 'Account Confirmation Certificate', baseReportName: 'Account Confirmation Certificate', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '2', reportName: 'Account Statement – Comprehensive', baseReportName: 'Account Statement – Comprehensive', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard', isFavorite: true },
      { id: '3', reportName: 'Account Statement Details – ASIA', baseReportName: 'Account Statement Details – ASIA', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '4', reportName: 'Account Statement Details Report', baseReportName: 'Account Statement Details Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '5', reportName: 'Account Statement Details Report – Condensed', baseReportName: 'Account Statement Details Report – Condensed', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '6', reportName: 'Account Statement Report', baseReportName: 'Account Statement Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '7', reportName: 'Account Status Certificate', baseReportName: 'Account Status Certificate', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '8', reportName: 'Account Activity Summary Report', baseReportName: 'Account Activity Summary Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '9', reportName: 'Intraday Cash Position Statement', baseReportName: 'Intraday Cash Position Statement', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '10', reportName: 'Historical Transaction Activity Report', baseReportName: 'Historical Transaction Activity Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '11', reportName: 'Multi-Currency Account Statement', baseReportName: 'Multi-Currency Account Statement', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '12', reportName: 'Global Cash Consolidation Report', baseReportName: 'Global Cash Consolidation Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '13', reportName: 'High-Value Payment Summary Report', baseReportName: 'High-Value Payment Summary Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '14', reportName: 'Cheque Reconciliation Report', baseReportName: 'Cheque Reconciliation Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '15', reportName: 'Liquidity Management Statement', baseReportName: 'Liquidity Management Statement', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '16', reportName: 'Cash Concentration Report', baseReportName: 'Cash Concentration Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '17', reportName: 'Sweeping & Pooling Activity Report', baseReportName: 'Sweeping & Pooling Activity Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '18', reportName: 'Virtual Account Statement Report', baseReportName: 'Virtual Account Statement Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '19', reportName: 'Escrow Account Balance Certificate', baseReportName: 'Escrow Account Balance Certificate', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '20', reportName: 'Third-Party Bank Account Activity', baseReportName: 'Third-Party Bank Account Activity', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '21', reportName: 'Foreign Exchange Settlement Statement', baseReportName: 'Foreign Exchange Settlement Statement', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '22', reportName: 'Interest & Charges Summary Report', baseReportName: 'Interest & Charges Summary Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '23', reportName: 'Overdraft & Credit Line Activity', baseReportName: 'Overdraft & Credit Line Activity', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '24', reportName: 'Month-End Ledger Balance Certificate', baseReportName: 'Month-End Ledger Balance Certificate', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' },
      { id: '25', reportName: 'Audit Trail & Balance Confirmation Report', baseReportName: 'Audit Trail & Balance Confirmation Report', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' }
    ];
  }

  getMockStatementData(criteria?: ReportCriteria): StatementReportData {
    // Exact seed data from document specification:
    // 7 transactions on 22/01/2022 for account XX12CITI11223344446677 (GBP)
    // Credits: 21,020.67; 43,360.47; 217,765.85; 1,437.63; 37,683.05 (Total Credits = 321,267.67, Count = 5)
    // Debits: 57,311.86; 234,705.99 (Total Debits = 292,017.85, Count = 2)
    // Opening balance = 1,074,252.00
    // Closing balance = 1,103,501.82
    // Net Transaction Amount = 321,267.67 - 292,017.85 = +29,249.82
    // 1,074,252.00 + 29,249.82 = 1,103,501.82
    return {
      bankName: 'CITIBANK',
      customerNumberName: '0000244654 / A CUSTOMER NAME',
      branchNumberName: '600 / A BRANCH NAME',
      swiftCode: 'CITIGB2L',
      accountNumberName: 'XX12CITI11223344446677 / AN ACCOUNT NAME',
      currency: 'GBP',
      accountType: 'CURRENT / OPERATING',
      statementDate: '22/01/2022',
      openingBalance: 1074252.00,
      closingBalance: 1103501.82,
      creditCount: 5,
      totalCreditAmount: 321267.67,
      debitCount: 2,
      totalDebitAmount: 292017.85,
      netTransactionAmount: 29249.82,
      branchSupportsRunningBalance: true,
      transactions: [
        {
          id: 'TXN-001',
          valueDate: '22/01/2022',
          customerReference: 'CUST-REF-90812',
          bankReference: 'BK-CITI-001',
          description: 'SUPPLIER SETTLEMENT CR',
          orderingPartyName: 'ACME SUPPLIES LTD',
          beneficiaryName: 'A CUSTOMER NAME',
          remittanceInformation: 'INV-2022-0941',
          debitCredit: 'C',
          amount: 21020.67,
          runningBalance: 1095272.67,
          productType: 'DOMESTIC_TRANSFER',
          entryDate: '22/01/2022 08:30:15',
          batchTrackNumber: 'BAT-2022-881',
          paymentDetails: 'INVOICE PAYMENT JAN',
          originatingBank: 'BARCLAYS BANK PLC',
          bankClearingId: '20-00-00',
          beneficiaryBank: 'CITIBANK N.A. LONDON',
          byOrderOf: 'ACME TREASURY',
          addressLines: ['123 HIGH STREET', 'LONDON EC2', 'UNITED KINGDOM']
        },
        {
          id: 'TXN-002',
          valueDate: '22/01/2022',
          customerReference: 'CUST-REF-90813',
          bankReference: 'BK-CITI-002',
          description: 'CLIENT REMITTANCE CR',
          orderingPartyName: 'GLOBAL LOGISTICS CORP',
          beneficiaryName: 'A CUSTOMER NAME',
          remittanceInformation: 'FREIGHT CHARGES',
          debitCredit: 'C',
          amount: 43360.47,
          runningBalance: 1138633.14,
          productType: 'CROSS_BORDER_WIRE',
          entryDate: '22/01/2022 09:15:20',
          batchTrackNumber: 'BAT-2022-882',
          paymentDetails: 'FREIGHT REMITTANCE',
          originatingBank: 'HSBC UK BANK PLC',
          bankClearingId: '40-05-30',
          beneficiaryBank: 'CITIBANK N.A. LONDON',
          byOrderOf: 'GL FIN CORP',
          addressLines: ['45 LOGISTICS WAY', 'BIRMINGHAM B1', 'UNITED KINGDOM']
        },
        {
          id: 'TXN-003',
          valueDate: '22/01/2022',
          customerReference: 'CUST-REF-90814',
          bankReference: 'BK-CITI-003',
          description: 'DIVIDEND & INTEREST CR',
          orderingPartyName: 'CITI TRUST DEPOSIT',
          beneficiaryName: 'A CUSTOMER NAME',
          remittanceInformation: 'Q4 DIVIDEND REINVEST',
          debitCredit: 'C',
          amount: 217765.85,
          runningBalance: 1356398.99,
          productType: 'TREASURY_TRANSFER',
          entryDate: '22/01/2022 10:45:00',
          batchTrackNumber: 'BAT-2022-883',
          paymentDetails: 'DIVIDEND PROCEEDS',
          originatingBank: 'CITIBANK N.A. NEW YORK',
          bankClearingId: 'CITIUS33',
          beneficiaryBank: 'CITIBANK N.A. LONDON',
          byOrderOf: 'CITI ASSET MANAGEMENT',
          addressLines: ['388 GREENWICH ST', 'NEW YORK NY 10013', 'USA']
        },
        {
          id: 'TXN-004',
          valueDate: '22/01/2022',
          customerReference: 'CUST-REF-90815',
          bankReference: 'BK-CITI-004',
          description: 'PAYROLL DISBURSEMENT DR',
          orderingPartyName: 'A CUSTOMER NAME',
          beneficiaryName: 'EXECUTIVE PAYROLL TRUST',
          remittanceInformation: 'SALARY RUN JAN 2022',
          debitCredit: 'D',
          amount: 57311.86,
          runningBalance: 1299087.13,
          productType: 'DIRECT_DEBIT',
          entryDate: '22/01/2022 11:30:10',
          batchTrackNumber: 'BAT-2022-884',
          paymentDetails: 'PAYROLL BACS',
          originatingBank: 'CITIBANK N.A. LONDON',
          bankClearingId: '08-00-99',
          beneficiaryBank: 'LLOYDS BANK PLC',
          byOrderOf: 'HR OPERATIONS',
          addressLines: ['CANARY WHARF', 'LONDON E14 5LB', 'UNITED KINGDOM']
        },
        {
          id: 'TXN-005',
          valueDate: '22/01/2022',
          customerReference: 'CUST-REF-90816',
          bankReference: 'BK-CITI-005',
          description: 'VENDOR SETTLEMENT DR',
          orderingPartyName: 'A CUSTOMER NAME',
          beneficiaryName: 'ENTERPRISE TECH HARDWARE',
          remittanceInformation: 'SERVER UPGRADE PO-889',
          debitCredit: 'D',
          amount: 234705.99,
          runningBalance: 1064381.14,
          productType: 'CHAPS_WIRE',
          entryDate: '22/01/2022 13:20:45',
          batchTrackNumber: 'BAT-2022-885',
          paymentDetails: 'IT INFRASTRUCTURE',
          originatingBank: 'CITIBANK N.A. LONDON',
          bankClearingId: '08-00-99',
          beneficiaryBank: 'NATWEST BANK PLC',
          byOrderOf: 'PROCUREMENT DEPT',
          addressLines: ['TECH PARK BLVD', 'CAMBRIDGE CB4', 'UNITED KINGDOM']
        },
        {
          id: 'TXN-006',
          valueDate: '22/01/2022',
          customerReference: 'CUST-REF-90817',
          bankReference: 'BK-CITI-006',
          description: 'ACCOUNT INTEREST CR',
          orderingPartyName: 'CITIBANK N.A.',
          beneficiaryName: 'A CUSTOMER NAME',
          remittanceInformation: 'CREDIT INTEREST ACCRUAL',
          debitCredit: 'C',
          amount: 1437.63,
          runningBalance: 1065818.77,
          productType: 'BANK_INTEREST',
          entryDate: '22/01/2022 15:00:00',
          batchTrackNumber: 'BAT-2022-886',
          paymentDetails: 'MONTHLY INTEREST',
          originatingBank: 'CITIBANK N.A. LONDON',
          bankClearingId: '08-00-99',
          beneficiaryBank: 'CITIBANK N.A. LONDON',
          byOrderOf: 'TREASURY DEPT',
          addressLines: ['CITIGROUP CENTRE', 'LONDON E14 5LB', 'UNITED KINGDOM']
        },
        {
          id: 'TXN-007',
          valueDate: '22/01/2022',
          customerReference: 'CUST-REF-90818',
          bankReference: 'BK-CITI-007',
          description: 'FX SETTLEMENT CR',
          orderingPartyName: 'CITI FX DESK',
          beneficiaryName: 'A CUSTOMER NAME',
          remittanceInformation: 'EUR/GBP SPOT SETTLE',
          debitCredit: 'C',
          amount: 37683.05,
          runningBalance: 1103501.82,
          productType: 'FX_SETTLEMENT',
          entryDate: '22/01/2022 16:30:00',
          batchTrackNumber: 'BAT-2022-887',
          paymentDetails: 'FX TRADE SPOT 9921',
          originatingBank: 'CITIBANK N.A. LONDON',
          bankClearingId: '08-00-99',
          beneficiaryBank: 'CITIBANK N.A. LONDON',
          byOrderOf: 'FX GLOBAL MARKETS',
          addressLines: ['CITIGROUP CENTRE', 'LONDON E14 5LB', 'UNITED KINGDOM']
        }
      ]
    };
  }

  getMockExecutionJobs(): ExecutionJob[] {
    return [
      {
        id: '1',
        jobId: 'JOB-2023-9001',
        reportName: 'Account Statement – Comprehensive (Yesterday)',
        format: 'Adobe PDF',
        status: 'COMPLETED',
        requestedAt: '2023-01-23 08:30:00 GMT',
        completedAt: '2023-01-23 08:30:05 GMT',
        recordCount: 7,
        downloadUrl: '/api/v1/reports/download/JOB-2023-9001'
      },
      {
        id: '2',
        jobId: 'JOB-2023-9002',
        reportName: 'Account Statement – Comprehensive (Excel 60-cols)',
        format: 'Excel (XLS)',
        status: 'COMPLETED',
        requestedAt: '2023-01-23 09:15:00 GMT',
        completedAt: '2023-01-23 09:15:08 GMT',
        recordCount: 7,
        downloadUrl: '/api/v1/reports/download/JOB-2023-9002'
      },
      {
        id: '3',
        jobId: 'JOB-2023-9003',
        reportName: 'Account Statement – Comprehensive (CSV Stream)',
        format: 'Comma Separated Value (CSV)',
        status: 'COMPLETED',
        requestedAt: '2023-01-23 10:00:00 GMT',
        completedAt: '2023-01-23 10:00:02 GMT',
        recordCount: 7,
        downloadUrl: '/api/v1/reports/download/JOB-2023-9003'
      }
    ];
  }
}
