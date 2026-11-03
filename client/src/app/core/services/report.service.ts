import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { ReportItem, ReportCriteria, ReportSchedule } from '../models/report.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/reports`;

  // Fallback mock reports
  private mockReports: ReportItem[] = [
    {
      id: 'REP-1001',
      reportName: 'Account Statement - Comprehensive',
      reportType: 'CASH_STATEMENT',
      branchCode: 'NYC-001',
      customerId: 'CUST-884920',
      accountNumber: '110293848201',
      currency: 'USD',
      lastRunDate: '2026-03-31 18:30:00',
      status: 'COMPLETED'
    },
    {
      id: 'REP-1002',
      reportName: 'APAC Intra-Day Ledger Summary',
      reportType: 'INTRADAY_LEDGER',
      branchCode: 'SGP-002',
      customerId: 'CUST-394821',
      accountNumber: '449302194820',
      currency: 'SGD',
      lastRunDate: '2026-03-31 17:45:00',
      status: 'COMPLETED'
    },
    {
      id: 'REP-1003',
      reportName: 'EMEA Corporate Cash Balance',
      reportType: 'CASH_BALANCE',
      branchCode: 'LON-004',
      customerId: 'CUST-992014',
      accountNumber: '994820194822',
      currency: 'EUR',
      lastRunDate: '2026-03-30 08:00:00',
      status: 'SCHEDULED'
    },
    {
      id: 'REP-1004',
      reportName: 'Treasury Dual-Control Cash Flow',
      reportType: 'TREASURY_FLOW',
      branchCode: 'NYC-001',
      customerId: 'CUST-884920',
      accountNumber: '110293848299',
      currency: 'USD',
      lastRunDate: '2026-03-29 12:00:00',
      status: 'PENDING'
    }
  ];

  private mockSchedules: ReportSchedule[] = [
    {
      id: 'SCHED-1029',
      scheduleName: 'Daily APAC Treasury Statement',
      reportTemplateId: 'REP-1002',
      baseReportName: 'APAC Intra-Day Ledger Summary',
      startDate: '2026-04-01',
      startTime: '08:00',
      frequency: 'DAILY',
      cronExpression: '0 0 8 * * ?',
      intradayHours: 0,
      intradayMinutes: 30,
      intradaySeconds: 0,
      triggerEvent: 'END_OF_DAY',
      notifyEmails: 'treasury-ops@corp.citi.com',
      deliveryOptionId: 'DEL-001',
      status: 'PENDING_AUTHORIZATION',
      makerId: 'user_maker_01'
    },
    {
      id: 'SCHED-1030',
      scheduleName: 'Weekly EMEA Account Reconciliation',
      reportTemplateId: 'REP-1003',
      baseReportName: 'EMEA Corporate Cash Balance',
      startDate: '2026-04-05',
      startTime: '22:00',
      frequency: 'WEEKLY',
      cronExpression: '0 0 22 ? * FRI',
      intradayHours: 1,
      intradayMinutes: 0,
      intradaySeconds: 0,
      notifyEmails: 'emea-finance@corp.citi.com',
      deliveryOptionId: 'DEL-002',
      status: 'ACTIVE',
      makerId: 'user_maker_02',
      checkerId: 'user_checker_01'
    }
  ];

  getReports(filter?: { dateRange?: string; accountNumber?: string; branchCode?: string; status?: string }): Observable<ReportItem[]> {
    let params = new HttpParams();
    if (filter?.dateRange) params = params.set('dateRange', filter.dateRange);
    if (filter?.accountNumber) params = params.set('accountNumber', filter.accountNumber);
    if (filter?.branchCode) params = params.set('branchCode', filter.branchCode);
    if (filter?.status) params = params.set('status', filter.status);

    return this.http.get<ReportItem[]>(this.baseUrl, { params }).pipe(
      catchError(() => {
        let results = [...this.mockReports];
        if (filter?.accountNumber) {
          results = results.filter(r => r.accountNumber.includes(filter.accountNumber!));
        }
        if (filter?.branchCode) {
          results = results.filter(r => r.branchCode === filter.branchCode);
        }
        if (filter?.status) {
          results = results.filter(r => r.status === filter.status);
        }
        return of(results);
      })
    );
  }

  generateReport(criteriaId: string, criteriaPayload?: Partial<ReportCriteria>): Observable<{ status: string; reportId: string; message: string }> {
    return this.http.post<{ status: string; reportId: string; message: string }>(`${this.baseUrl}/${criteriaId}/generate`, criteriaPayload || {}).pipe(
      catchError(() => of({
        status: 'SUCCESS',
        reportId: `GEN-${Date.now()}`,
        message: 'Statement generation request accepted and queued successfully.'
      }))
    );
  }

  exportReport(reportId: string, format: 'PDF' | 'EXCEL' | 'CSV'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    }).pipe(
      catchError(() => {
        const dummyContent = format === 'CSV' 
          ? 'Date,Value Date,Ref,Description,Debit,Credit,Balance\n2026-03-31,2026-03-31,TXN101,Opening Balance,,,"1,000,000.00"'
          : 'CitiDirect Cash Statement Export Dummy Binary Payload';
        return of(new Blob([dummyContent], { type: format === 'PDF' ? 'application/pdf' : 'text/plain' }));
      })
    );
  }

  getSchedules(): Observable<ReportSchedule[]> {
    return this.http.get<ReportSchedule[]>(`${this.baseUrl}/schedule`).pipe(
      catchError(() => of(this.mockSchedules))
    );
  }

  createSchedule(schedule: Partial<ReportSchedule>): Observable<ReportSchedule> {
    return this.http.post<ReportSchedule>(`${this.baseUrl}/schedule`, schedule).pipe(
      catchError(() => {
        const newSched: ReportSchedule = {
          id: `SCHED-${Math.floor(1000 + Math.random() * 9000)}`,
          scheduleName: schedule.scheduleName || 'Custom Statement Schedule',
          reportTemplateId: schedule.reportTemplateId || 'REP-1001',
          baseReportName: schedule.baseReportName || 'Account Statement - Comprehensive',
          startDate: schedule.startDate || new Date().toISOString().slice(0, 10),
          startTime: schedule.startTime || '08:00',
          frequency: schedule.frequency || 'DAILY',
          cronExpression: schedule.cronExpression || '0 0 8 * * ?',
          intradayHours: schedule.intradayHours || 0,
          intradayMinutes: schedule.intradayMinutes || 30,
          intradaySeconds: schedule.intradaySeconds || 0,
          triggerEvent: schedule.triggerEvent,
          notifyEmails: schedule.notifyEmails,
          deliveryOptionId: schedule.deliveryOptionId,
          status: 'PENDING_AUTHORIZATION',
          makerId: 'current_maker_user'
        };
        this.mockSchedules.unshift(newSched);
        return of(newSched);
      })
    );
  }

  authorizeSchedule(scheduleId: string, checkerComments?: string): Observable<{ status: string; scheduleId: string }> {
    return this.http.post<{ status: string; scheduleId: string }>(`${environment.apiBaseUrl}/api/delivery-options/${scheduleId}/authorize`, {
      scheduleId,
      authorizationAction: 'AUTHORIZE',
      checkerComments: checkerComments || 'Approved by dual-control checker.'
    }).pipe(
      catchError(() => {
        const sched = this.mockSchedules.find(s => s.id === scheduleId);
        if (sched) {
          sched.status = 'ACTIVE';
          sched.checkerId = 'user_checker_01';
        }
        return of({ status: 'AUTHORIZED', scheduleId });
      })
    );
  }

  rejectSchedule(scheduleId: string, rejectionReason: string): Observable<{ status: string; scheduleId: string }> {
    return this.http.post<{ status: string; scheduleId: string }>(`${environment.apiBaseUrl}/api/delivery-options/${scheduleId}/reject`, {
      scheduleId,
      authorizationAction: 'REJECT',
      rejectionReason: rejectionReason || 'Rejected per policy violation.'
    }).pipe(
      catchError(() => {
        const sched = this.mockSchedules.find(s => s.id === scheduleId);
        if (sched) {
          sched.status = 'REJECTED';
          sched.checkerId = 'user_checker_01';
          sched.rejectionReason = rejectionReason;
        }
        return of({ status: 'REJECTED', scheduleId });
      })
    );
  }
}
