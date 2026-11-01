import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  BaseReport,
  ReportCriteria,
  CriteriaPayload,
  DerivedReportRequest,
  DerivedReportResponse,
  DefaultCriteriaResponse,
  ExecutionResponse
} from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private api: ApiService) {}

  getBaseReports(): Observable<BaseReport[]> {
    return this.api.get<BaseReport[]>('/api/v1/reports/base');
  }

  getCriteriaDefaults(): Observable<ReportCriteria> {
    return this.api.get<DefaultCriteriaResponse>('/api/v1/reports/criteria/defaults').pipe(
      map(resp => this.mapDefaultResponseToReportCriteria(resp))
    );
  }

  getCriteriaById(id: string): Observable<ReportCriteria> {
    return this.api.get<DerivedReportResponse>(`/api/v1/reports/criteria/${id}`).pipe(
      map(resp => this.mapDerivedResponseToReportCriteria(resp))
    );
  }

  listCriteria(): Observable<DerivedReportResponse[]> {
    return this.api.get<DerivedReportResponse[]>('/api/v1/reports/criteria');
  }

  saveCriteria(criteria: ReportCriteria): Observable<DerivedReportResponse> {
    const request: DerivedReportRequest = {
      derivedReportName: criteria.derivedReportName,
      baseReportName: criteria.baseReportName || 'Account Statement – Comprehensive',
      format: criteria.format || 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      deliveryOptionId: criteria.deliveryOptionId || undefined,
      designatedOwner: criteria.designatedOwner || undefined,
      share: criteria.share || 'PRIVATE',
      favorite: !!criteria.favorite,
      criteria: this.mapToCriteriaPayload(criteria)
    };

    if (criteria.id) {
      return this.api.put<DerivedReportResponse>(`/api/v1/reports/criteria/${criteria.id}`, request);
    }
    return this.api.post<DerivedReportResponse>('/api/v1/reports/criteria', request);
  }

  updateCriteria(id: string, criteria: ReportCriteria): Observable<DerivedReportResponse> {
    const request: DerivedReportRequest = {
      derivedReportName: criteria.derivedReportName,
      baseReportName: criteria.baseReportName || 'Account Statement – Comprehensive',
      format: criteria.format || 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      deliveryOptionId: criteria.deliveryOptionId || undefined,
      designatedOwner: criteria.designatedOwner || undefined,
      share: criteria.share || 'PRIVATE',
      favorite: !!criteria.favorite,
      criteria: this.mapToCriteriaPayload(criteria)
    };
    return this.api.put<DerivedReportResponse>(`/api/v1/reports/criteria/${id}`, request);
  }

  deleteCriteria(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/reports/criteria/${id}`);
  }

  runReport(criteria: ReportCriteria, overrideFormat?: string): Observable<Blob> {
    const payload = {
      derivedReportId: criteria.id || undefined,
      reportName: criteria.derivedReportName || criteria.baseReportName || 'Account Statement – Comprehensive',
      overrideFormat: overrideFormat || criteria.format,
      criteria: this.mapToCriteriaPayload(criteria)
    };
    return this.api.downloadFile('/api/v1/reports/execution/run', payload);
  }

  exportReportFile(criteria: ReportCriteria, format: string): Observable<Blob> {
    return this.runReport(criteria, format);
  }

  getMyReports(): Observable<ExecutionResponse[]> {
    return this.api.get<ExecutionResponse[]>('/api/v1/reports/my-reports');
  }

  downloadReport(executionId: string): Observable<Blob> {
    return this.api.getFile(`/api/v1/reports/my-reports/${executionId}/download`);
  }

  mapToCriteriaPayload(criteria: ReportCriteria): CriteriaPayload {
    const branchNumber = this.extractCode(criteria.branchNumberName);
    const customerNumber = this.extractCode(criteria.customerNumberName);
    const accountNumber = this.extractCode(criteria.accountNumberName);

    return {
      branchNumber: branchNumber || undefined,
      customerNumber: customerNumber || undefined,
      accountSelectionType: criteria.accountSelectionType || 'ACCOUNT',
      accountNumber: accountNumber || undefined,
      bankReference: criteria.bankReferenceValue || undefined,
      bankReferenceOperator: this.normalizeOperator(criteria.bankReferenceOperator),
      customerReference: criteria.customerReferenceValue || undefined,
      customerReferenceOperator: this.normalizeOperator(criteria.customerReferenceOperator),
      amountFrom: criteria.transactionAmountFrom !== null && criteria.transactionAmountFrom !== undefined ? Number(criteria.transactionAmountFrom) : null,
      amountTo: criteria.transactionAmountTo !== null && criteria.transactionAmountTo !== undefined ? Number(criteria.transactionAmountTo) : null,
      accountCurrency: criteria.accountCurrency || undefined,
      transactionDescription: criteria.transactionDescriptionValue || undefined,
      byOrderBeneficiary: criteria.byOrderBeneficiary || undefined,
      transactionCode: criteria.transactionCode || 'Citi Transaction Codes',
      cheques: criteria.cheques || 'Include Cheques',
      baseCurrency: criteria.baseCurrency || 'USD',
      showEnhancedTransactionDetails: !!criteria.showEnhancedTransactionDetails,
      outputAccountSubTotals: !!criteria.outputAccountSubTotals,
      outputGrandTotal: !!criteria.outputGrandTotal,
      showAdditionalOrderingPartyDetails: !!criteria.showAdditionalOrderingPartyBeneficiary,
      statementDateRadio: this.normalizeDateRadio(criteria.statementDateRadio),
      statementDateFrom: criteria.statementDateFrom || undefined,
      statementDateTo: criteria.statementDateTo || undefined,
      valueDateRadio: this.normalizeDateRadio(criteria.valueDateRadio),
      valueDateFrom: criteria.valueDateFrom || undefined,
      valueDateTo: criteria.valueDateTo || undefined,
      pageBreaks: criteria.pageBreaks !== false,
      printChinaStamp: !!criteria.printCitibankChinaStamp,
      activityOnly: !!criteria.activityOnly,
      runInIncrementalMode: !!criteria.runInIncrementalMode,
      printSelectionCriteria: criteria.printSelectionCriteria !== false,
      signWithCertificate: !!criteria.signWithCertificate,
      compressWithWinzip: !!criteria.compressWithWinzip
    };
  }

  mapDerivedResponseToReportCriteria(resp: DerivedReportResponse): ReportCriteria {
    const cp = resp.criteria || {};
    return {
      id: resp.id,
      derivedReportName: resp.derivedReportName,
      baseReportName: resp.baseReportName,
      format: resp.format,
      signWithCertificate: !!cp.signWithCertificate,
      compressWithWinzip: !!cp.compressWithWinzip,
      deliveryOptionId: resp.deliveryOptionId || '',
      deliveryOptionName: '',
      designatedOwner: resp.ownerUsername || 'JUSTIN,JOHN',
      share: resp.sharedPublic ? 'PUBLIC' : 'PRIVATE',
      favorite: !!resp.favorite,
      branchNumberName: cp.branchNumber || '',
      customerNumberName: cp.customerNumber || '',
      accountSelectionType: cp.accountSelectionType || 'ACCOUNT',
      accountNumberName: cp.accountNumber || '',
      bankReferenceOperator: this.denormalizeOperator(cp.bankReferenceOperator),
      bankReferenceValue: cp.bankReference || '',
      customerReferenceOperator: this.denormalizeOperator(cp.customerReferenceOperator),
      customerReferenceValue: cp.customerReference || '',
      transactionAmountFrom: cp.amountFrom ?? null,
      transactionAmountTo: cp.amountTo ?? null,
      accountCurrency: cp.accountCurrency || 'GBP',
      transactionDescriptionOperator: 'Equals',
      transactionDescriptionValue: cp.transactionDescription || '',
      byOrderBeneficiary: cp.byOrderBeneficiary || '',
      transactionCode: cp.transactionCode || 'Citi Transaction Codes',
      cheques: cp.cheques || 'Include Cheques',
      baseCurrency: cp.baseCurrency || 'USD',
      showEnhancedTransactionDetails: !!cp.showEnhancedTransactionDetails,
      outputAccountSubTotals: !!cp.outputAccountSubTotals,
      outputGrandTotal: !!cp.outputGrandTotal,
      showAdditionalOrderingPartyBeneficiary: !!cp.showAdditionalOrderingPartyDetails,
      statementDateRadio: this.denormalizeDateRadio(cp.statementDateRadio),
      statementDateFrom: cp.statementDateFrom || '',
      statementDateTo: cp.statementDateTo || '',
      valueDateRadio: this.denormalizeDateRadio(cp.valueDateRadio),
      valueDateFrom: cp.valueDateFrom || '',
      valueDateTo: cp.valueDateTo || '',
      pageBreaks: cp.pageBreaks !== false,
      printCitibankChinaStamp: !!cp.printChinaStamp,
      activityOnly: !!cp.activityOnly,
      runInIncrementalMode: !!cp.runInIncrementalMode,
      printSelectionCriteria: cp.printSelectionCriteria !== false
    };
  }

  mapDefaultResponseToReportCriteria(resp: DefaultCriteriaResponse): ReportCriteria {
    const cp = resp.criteriaPayload || {};
    return {
      derivedReportName: resp.derivedReportName || '',
      baseReportName: resp.baseReportName || 'Account Statement – Comprehensive',
      format: resp.format || 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      signWithCertificate: resp.signWithCertificate,
      compressWithWinzip: resp.compressWithWinzip,
      deliveryOptionId: '',
      deliveryOptionName: '',
      designatedOwner: resp.designatedOwner || 'JUSTIN,JOHN',
      share: (resp.share as any) || 'PRIVATE',
      favorite: resp.favorite,
      branchNumberName: cp.branchNumber || '600 - A BRANCH NAME',
      customerNumberName: cp.customerNumber || '0000244654 - A CUSTOMER NAME',
      accountSelectionType: resp.accountSelectionType || 'ACCOUNT',
      accountNumberName: cp.accountNumber || 'XX12CITI11223344446677 - AN ACCOUNT NAME',
      bankReferenceOperator: 'Equals',
      bankReferenceValue: cp.bankReference || '',
      customerReferenceOperator: 'Equals',
      customerReferenceValue: cp.customerReference || '',
      transactionAmountFrom: cp.amountFrom ?? null,
      transactionAmountTo: cp.amountTo ?? null,
      accountCurrency: cp.accountCurrency || 'GBP',
      transactionDescriptionOperator: 'Equals',
      transactionDescriptionValue: cp.transactionDescription || '',
      byOrderBeneficiary: cp.byOrderBeneficiary || '',
      transactionCode: resp.transactionCode || 'Citi Transaction Codes',
      cheques: resp.cheques || 'Include Cheques',
      baseCurrency: resp.baseCurrency || 'USD',
      showEnhancedTransactionDetails: resp.showEnhancedTransactionDetails,
      outputAccountSubTotals: resp.outputAccountSubTotals,
      outputGrandTotal: resp.outputGrandTotal,
      showAdditionalOrderingPartyBeneficiary: resp.showAdditionalOrderingPartyDetails,
      statementDateRadio: this.denormalizeDateRadio(resp.statementDateRadio || 'YESTERDAY'),
      statementDateFrom: cp.statementDateFrom || '',
      statementDateTo: cp.statementDateTo || '',
      valueDateRadio: this.denormalizeDateRadio(resp.valueDateRadio || 'NO_DATE_SELECTED'),
      valueDateFrom: cp.valueDateFrom || '',
      valueDateTo: cp.valueDateTo || '',
      pageBreaks: resp.pageBreaks,
      printCitibankChinaStamp: resp.printChinaStamp,
      activityOnly: resp.activityOnly,
      runInIncrementalMode: resp.runInIncrementalMode,
      printSelectionCriteria: resp.printSelectionCriteria
    };
  }

  private extractCode(str?: string): string {
    if (!str) return '';
    const parts = str.split(' - ');
    return parts[0].trim();
  }

  private normalizeOperator(op?: string): string {
    if (!op) return 'EQUALS';
    const upper = op.toUpperCase();
    if (upper.includes('CONTAIN')) return 'CONTAINS';
    if (upper.includes('START')) return 'STARTS_WITH';
    return 'EQUALS';
  }

  private denormalizeOperator(op?: string): string {
    if (!op) return 'Equals';
    if (op === 'CONTAINS') return 'Contains';
    if (op === 'STARTS_WITH') return 'Starts With';
    return 'Equals';
  }

  private normalizeDateRadio(radio?: string): string {
    if (!radio) return 'YESTERDAY';
    const r = radio.toUpperCase();
    if (r.includes('NO DATE')) return 'NO_DATE_SELECTED';
    if (r.includes('CURRENT MONTH')) return 'CURRENT_MONTH';
    if (r.includes('PREVIOUS MONTH')) return 'PREVIOUS_MONTH';
    if (r.includes('TODAY')) return 'TODAY';
    if (r.includes('YESTERDAY')) return 'YESTERDAY';
    if (r.includes('7')) return 'LAST_7_DAYS';
    if (r.includes('14')) return 'LAST_14_DAYS';
    if (r.includes('30')) return 'LAST_30_DAYS';
    if (r.includes('RANGE')) return 'DATE_RANGE';
    if (r.includes('LATEST')) return 'LATEST';
    return radio.replace(/\s+/g, '_').toUpperCase();
  }

  private denormalizeDateRadio(radio?: string): string {
    if (!radio) return 'Yesterday';
    switch (radio.toUpperCase()) {
      case 'NO_DATE_SELECTED': return 'No Date Selected';
      case 'CURRENT_MONTH': return 'Current Month';
      case 'PREVIOUS_MONTH': return 'Previous Month';
      case 'TODAY': return 'Today';
      case 'YESTERDAY': return 'Yesterday';
      case 'LAST_7_DAYS': return 'Last 7 Days';
      case 'LAST_14_DAYS': return 'Last 14 Days';
      case 'LAST_30_DAYS': return 'Last 30 Days';
      case 'DATE_RANGE': return 'Date Range';
      case 'LATEST': return 'Latest';
      default: return radio;
    }
  }
}
