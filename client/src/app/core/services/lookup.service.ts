import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseReport, LookupBranch, LookupCustomer, LookupAccount } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private mockBaseReports: BaseReport[] = [
    {
      id: 'rpt-001',
      reportCode: 'CASH_STMT_EOD',
      name: 'End of Day Consolidated Cash Statement',
      formatStandard: 'SWIFT MT940',
      category: 'Cash Statement',
      defaultFrequency: 'Daily 17:00 EST',
      description: 'Pre-configured CitiDirect cash statement report template code.'
    },
    {
      id: 'rpt-002',
      reportCode: 'INTRADAY_BAI2',
      name: 'Intraday Account Activity Ledger',
      formatStandard: 'BAI2 Standard',
      category: 'Liquidity Feeds',
      defaultFrequency: '2-Hour Interval',
      description: 'Intraday feed for real-time ledger accounting.'
    },
    {
      id: 'rpt-003',
      reportCode: 'INTERIM_MT942',
      name: 'Interim Balance Report',
      formatStandard: 'SWIFT MT942',
      category: 'Interim Balance',
      defaultFrequency: 'Hourly',
      description: 'Hourly interim statement snapshot.'
    },
    {
      id: 'rpt-004',
      reportCode: 'SWEEP_AUDIT',
      name: 'Regional Cash Sweeping & ZBA Audit',
      formatStandard: 'CSV / Excel',
      category: 'Reconciliation',
      defaultFrequency: 'Daily EOD',
      description: 'Zero Balance Account sweeps and reconciliation.'
    },
    {
      id: 'rpt-005',
      reportCode: 'CAMT_053_XML',
      name: 'ISO 20022 Bank-to-Customer Statement',
      formatStandard: 'CAMT.053 XML',
      category: 'Cash Statement',
      defaultFrequency: 'Daily EOD',
      description: 'Structured ISO20022 XML feed for global corporate treasury.'
    }
  ];

  private mockBranches: LookupBranch[] = [
    { code: 'NYC-001', name: 'New York Main Branch', city: 'New York', country: 'USA' },
    { code: 'LON-044', name: 'London Canary Wharf', city: 'London', country: 'GBR' },
    { code: 'SIN-012', name: 'Singapore Marina Bay', city: 'Singapore', country: 'SGP' },
    { code: 'FRA-009', name: 'Frankfurt Main Desk', city: 'Frankfurt', country: 'DEU' },
    { code: 'HKG-002', name: 'Hong Kong Central', city: 'Hong Kong', country: 'HKG' },
    { code: 'ZRH-005', name: 'Zurich Paradeplatz', city: 'Zurich', country: 'CHE' }
  ];

  private mockAccounts: LookupAccount[] = [
    { accountNumber: 'CITI-US-99201488', accountName: 'USD Main Operational', currency: 'USD', branchCode: 'NYC-001', balance: 48520300.50 },
    { accountNumber: 'CITI-GB-88402199', accountName: 'GBP Treasury Clearing', currency: 'GBP', branchCode: 'LON-044', balance: 14209110.20 },
    { accountNumber: 'CITI-SG-44109833', accountName: 'SGD Regional Sweeping', currency: 'SGD', branchCode: 'SIN-012', balance: 32910400.00 },
    { accountNumber: 'CITI-DE-11029481', accountName: 'EUR Pooling Account', currency: 'EUR', branchCode: 'FRA-009', balance: 88190200.75 },
    { accountNumber: 'CITI-HK-55209118', accountName: 'HKD Multi-Currency Desk', currency: 'HKD', branchCode: 'HKG-002', balance: 195004000.00 },
    { accountNumber: 'CITI-US-33991204', accountName: 'USD ZBA Sweep Pool', currency: 'USD', branchCode: 'NYC-001', balance: 9140000.00 },
    { accountNumber: 'CITI-US-77884100', accountName: 'USD Escrow & Segregated Funds', currency: 'USD', branchCode: 'NYC-001', balance: 125000000.00 },
    { accountNumber: 'CITI-CH-66104882', accountName: 'CHF Liquidity Buffer', currency: 'CHF', branchCode: 'ZRH-005', balance: 22400100.00 }
  ];

  getReportNames(): Observable<BaseReport[]> {
    return this.http.get<BaseReport[]>(`${this.baseUrl}/lookup/report-names`).pipe(
      catchError(() => of(this.mockBaseReports))
    );
  }

  getBranches(): Observable<LookupBranch[]> {
    return this.http.get<LookupBranch[]>(`${this.baseUrl}/lookup/branches`).pipe(
      catchError(() => of(this.mockBranches))
    );
  }

  getAccounts(): Observable<LookupAccount[]> {
    return this.http.get<LookupAccount[]>(`${this.baseUrl}/lookup/accounts`).pipe(
      catchError(() => of(this.mockAccounts))
    );
  }
}
