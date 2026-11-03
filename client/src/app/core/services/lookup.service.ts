import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { LookupItem } from '../models/report.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/lookup`;

  private mockBranches: LookupItem[] = [
    { id: '1', code: 'NYC-001', name: 'New York Wall Street Branch', description: 'North America Corporate Headquarters' },
    { id: '2', code: 'SGP-002', name: 'Singapore Marina Bay Branch', description: 'APAC Regional Operations Hub' },
    { id: '3', code: 'LON-004', name: 'London Canary Wharf Branch', description: 'EMEA Corporate Banking Center' },
    { id: '4', code: 'TYO-008', name: 'Tokyo Otemachi Branch', description: 'Japan Global Markets Branch' },
    { id: '5', code: 'HKG-012', name: 'Hong Kong Central Branch', description: 'Greater China Commercial Banking' }
  ];

  private mockCustomers: LookupItem[] = [
    { id: '1', customerId: 'CUST-884920', name: 'Acme Global Conglomerate Inc.', description: 'Tier 1 Multinational Corporate' },
    { id: '2', customerId: 'CUST-394821', name: 'Pacific Apex Logistics Pte Ltd', description: 'APAC Maritime & Logistics' },
    { id: '3', customerId: 'CUST-992014', name: 'EuroGrid Renewable Energy SA', description: 'European Infrastructure Portfolio' },
    { id: '4', customerId: 'CUST-104928', name: 'Quantum FinTech Global LLC', description: 'Digital Assets & Liquidity Fund' }
  ];

  private mockAccounts: LookupItem[] = [
    { id: '1', accountNumber: '110293848201', currency: 'USD', name: 'Main Operating Concentration Account', branchCode: 'NYC-001', customerId: 'CUST-884920' },
    { id: '2', accountNumber: '110293848299', currency: 'USD', name: 'Treasury Dual-Control Disbursement Acct', branchCode: 'NYC-001', customerId: 'CUST-884920' },
    { id: '3', accountNumber: '449302194820', currency: 'SGD', name: 'Singapore Regional Clearing Account', branchCode: 'SGP-002', customerId: 'CUST-394821' },
    { id: '4', accountNumber: '994820194822', currency: 'EUR', name: 'Frankfurt Direct Settlement Account', branchCode: 'LON-004', customerId: 'CUST-992014' },
    { id: '5', accountNumber: '883920194811', currency: 'JPY', name: 'Tokyo Interbank Funding Sub-Account', branchCode: 'TYO-008', customerId: 'CUST-104928' }
  ];

  private mockReportNames: LookupItem[] = [
    { id: '1', code: 'REP-1001', name: 'Account Statement - Comprehensive', category: 'Cash Statements', module: 'Cash & Liquidity', description: 'Full transaction journal with balance reconciliation and trailing negative debit notation.' },
    { id: '2', code: 'REP-1002', name: 'APAC Intra-Day Ledger Summary', category: 'Intra-Day Reporting', module: 'Cash & Liquidity', description: 'Live intraday postings and projected daylight overdraft monitoring.' },
    { id: '3', code: 'REP-1003', name: 'EMEA Corporate Cash Balance', category: 'Balance Reports', module: 'Treasury & Liquidity', description: 'Multi-entity end-of-day cash position aggregation.' },
    { id: '4', code: 'REP-1004', name: 'Treasury Dual-Control Cash Flow', category: 'Audit & Compliance', module: 'Governance & Risk', description: 'Maker-checker audit trail for high-value fund movements.' }
  ];

  getBranches(query?: string): Observable<LookupItem[]> {
    const params = query ? new HttpParams().set('query', query) : undefined;
    return this.http.get<LookupItem[]>(`${this.baseUrl}/branches`, { params }).pipe(
      catchError(() => of(this.filterLookup(this.mockBranches, query)))
    );
  }

  getCustomers(query?: string): Observable<LookupItem[]> {
    const params = query ? new HttpParams().set('query', query) : undefined;
    return this.http.get<LookupItem[]>(`${this.baseUrl}/customers`, { params }).pipe(
      catchError(() => of(this.filterLookup(this.mockCustomers, query)))
    );
  }

  getAccounts(branchCode?: string, customerId?: string): Observable<LookupItem[]> {
    let params = new HttpParams();
    if (branchCode) params = params.set('branchCode', branchCode);
    if (customerId) params = params.set('customerId', customerId);

    return this.http.get<LookupItem[]>(`${this.baseUrl}/accounts`, { params }).pipe(
      catchError(() => {
        let results = [...this.mockAccounts];
        if (branchCode) results = results.filter(a => a.branchCode === branchCode);
        if (customerId) results = results.filter(a => a.customerId === customerId);
        return of(results);
      })
    );
  }

  getReportNames(query?: string): Observable<LookupItem[]> {
    const params = query ? new HttpParams().set('query', query) : undefined;
    return this.http.get<LookupItem[]>(`${this.baseUrl}/report-names`, { params }).pipe(
      catchError(() => of(this.filterLookup(this.mockReportNames, query)))
    );
  }

  private filterLookup(items: LookupItem[], query?: string): LookupItem[] {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(item => 
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.customerId && item.customerId.toLowerCase().includes(q)) ||
      (item.accountNumber && item.accountNumber.toLowerCase().includes(q))
    );
  }
}
