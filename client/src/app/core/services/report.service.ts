import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneratedReport, ReportCriteria, ReportSchedule } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private mockReports: GeneratedReport[] = [
    {
      id: 'rpt-01',
      reportName: 'EOD Consolidated Cash Balance MT940',
      accountNumbers: ['CITI-US-99201488'],
      branchCode: 'NYC-001',
      frequency: 'Daily EOD (MT940)',
      exportFormat: 'PDF',
      fileSizeBytes: 245100,
      status: 'COMPLETED',
      createdBy: 'M. Sterling (Maker)',
      createdAt: 'Oct 29, 2024 16:45'
    },
    {
      id: 'rpt-02',
      reportName: 'Intraday Liquidity Ledger BAI2',
      accountNumbers: ['CITI-GB-88402199'],
      branchCode: 'LON-044',
      frequency: 'Intraday 2h (BAI2)',
      exportFormat: 'PDF',
      fileSizeBytes: 184000,
      status: 'PENDING_APPROVAL',
      createdBy: 'R. Chen (Treasury Ops)',
      createdAt: 'Oct 29, 2024 16:32'
    },
    {
      id: 'rpt-03',
      reportName: 'APAC Regional Sweeping Statement',
      accountNumbers: ['CITI-SG-44109833'],
      branchCode: 'SIN-012',
      frequency: 'Daily EOD (MT940)',
      exportFormat: 'SWIFT_MT940',
      fileSizeBytes: 95000,
      status: 'GENERATING',
      createdBy: 'System Automated',
      createdAt: 'Oct 29, 2024 16:20'
    },
    {
      id: 'rpt-04',
      reportName: 'EMEA Multi-Currency Reconciliation',
      accountNumbers: ['CITI-DE-11029481'],
      branchCode: 'FRA-009',
      frequency: 'Ad-hoc (CSV)',
      exportFormat: 'CSV',
      fileSizeBytes: 312000,
      status: 'COMPLETED',
      createdBy: 'A. Gupta (Analyst)',
      createdAt: 'Oct 29, 2024 15:58'
    },
    {
      id: 'rpt-05',
      reportName: 'Treasury Zero-Balance Sweep Audit',
      accountNumbers: ['CITI-US-33991204'],
      branchCode: 'NYC-001',
      frequency: 'Daily EOD (MT940)',
      exportFormat: 'EXCEL',
      fileSizeBytes: 154000,
      status: 'REJECTED',
      errorMessage: 'Dual-control authorization rejected by Checker: Account threshold exceeded',
      createdBy: 'K. Horvath (Maker)',
      createdAt: 'Oct 29, 2024 15:40'
    },
    {
      id: 'rpt-06',
      reportName: 'Corporate Treasury Daily Activity',
      accountNumbers: ['CITI-US-99201488'],
      branchCode: 'NYC-001',
      frequency: 'Daily EOD (MT940)',
      exportFormat: 'PDF',
      fileSizeBytes: 218000,
      status: 'COMPLETED',
      createdBy: 'System Automated',
      createdAt: 'Oct 29, 2024 15:15'
    },
    {
      id: 'rpt-07',
      reportName: 'Global Cash Positioning MT942',
      accountNumbers: ['CITI-HK-55209118'],
      branchCode: 'HKG-002',
      frequency: 'Intraday 2h (BAI2)',
      exportFormat: 'SWIFT_MT940',
      fileSizeBytes: 142000,
      status: 'COMPLETED',
      createdBy: 'R. Chen (Treasury Ops)',
      createdAt: 'Oct 29, 2024 14:00'
    },
    {
      id: 'rpt-08',
      reportName: 'Escrow & Segregated Funds Daily',
      accountNumbers: ['CITI-US-77884100'],
      branchCode: 'NYC-001',
      frequency: 'Daily EOD (MT940)',
      exportFormat: 'PDF',
      fileSizeBytes: 520000,
      status: 'COMPLETED',
      createdBy: 'M. Sterling (Maker)',
      createdAt: 'Oct 29, 2024 13:30'
    },
    {
      id: 'rpt-09',
      reportName: 'Overnight Commercial Paper Cash Flow',
      accountNumbers: ['CITI-US-99201488'],
      branchCode: 'NYC-001',
      frequency: 'Monthly (PDF/Excel)',
      exportFormat: 'EXCEL',
      fileSizeBytes: 620000,
      status: 'COMPLETED',
      createdBy: 'A. Gupta (Analyst)',
      createdAt: 'Oct 29, 2024 12:15'
    },
    {
      id: 'rpt-10',
      reportName: 'Weekly Liquidity Buffer MT950',
      accountNumbers: ['CITI-CH-66104882'],
      branchCode: 'ZRH-005',
      frequency: 'Daily EOD (MT940)',
      exportFormat: 'PDF',
      fileSizeBytes: 198000,
      status: 'PENDING_APPROVAL',
      createdBy: 'K. Horvath (Maker)',
      createdAt: 'Oct 29, 2024 11:45'
    }
  ];

  getReports(filterParams?: { status?: string; account?: string; branch?: string }): Observable<GeneratedReport[]> {
    let params = new HttpParams();
    if (filterParams?.status && filterParams.status !== 'Status: All') {
      params = params.set('status', filterParams.status);
    }
    if (filterParams?.branch) {
      params = params.set('branch', filterParams.branch);
    }
    return this.http.get<GeneratedReport[]>(`${this.baseUrl}/reports`, { params }).pipe(
      catchError(() => of(this.mockReports))
    );
  }

  generateReport(criteria: ReportCriteria): Observable<GeneratedReport> {
    return this.http.post<GeneratedReport>(`${this.baseUrl}/reports/generate`, criteria).pipe(
      catchError(() => {
        const newReport: GeneratedReport = {
          id: `rpt-${Date.now()}`,
          criteriaId: criteria.id,
          reportName: criteria.name || 'On-Demand Account Statement',
          accountNumbers: criteria.accountNumbers,
          branchCode: criteria.branchCode,
          frequency: 'On-Demand Ad-Hoc',
          exportFormat: criteria.exportFormat,
          fileSizeBytes: 215000,
          status: 'COMPLETED',
          createdBy: 'J. Vance (Tier 4 Authorizer)',
          createdAt: new Date().toLocaleString()
        };
        this.mockReports.unshift(newReport);
        return of(newReport);
      })
    );
  }

  createSchedule(schedule: ReportSchedule): Observable<ReportSchedule> {
    return this.http.post<ReportSchedule>(`${this.baseUrl}/reports/schedule`, schedule).pipe(
      catchError(() => {
        const createdSchedule: ReportSchedule = {
          ...schedule,
          id: `sch-${Date.now()}`,
          status: 'PENDING_APPROVAL',
          createdAt: new Date().toISOString()
        };
        return of(createdSchedule);
      })
    );
  }

  exportReport(reportId: string, format: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/${reportId}/export?format=${format}`, { responseType: 'blob' }).pipe(
      catchError(() => {
        const mockContent = `Citibank N.A. Financial Ledger Export\nReport ID: ${reportId}\nExport Format: ${format}\nDate: ${new Date().toISOString()}\n`;
        return of(new Blob([mockContent], { type: 'text/plain' }));
      })
    );
  }
}
