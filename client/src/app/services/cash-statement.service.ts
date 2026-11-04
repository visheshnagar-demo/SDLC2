import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Account,
  ReportTemplate,
  StatementGenerateRequest,
  StatementGenerateResponse,
  ExportRequest,
  ScheduleDTO,
  AuditLog
} from '../models/cash-statement.model';

@Injectable({
  providedIn: 'root'
})
export class CashStatementService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/cash-statements';

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/lookups/accounts`);
  }

  getReportTemplates(): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.baseUrl}/lookups/report-templates`);
  }

  generateStatement(request: StatementGenerateRequest): Observable<StatementGenerateResponse> {
    return this.http.post<StatementGenerateResponse>(`${this.baseUrl}/generate`, request);
  }

  exportStatement(request: ExportRequest, async: boolean = false): Observable<Blob | any> {
    const params = new HttpParams().set('async', String(async));
    if (async) {
      return this.http.post<any>(`${this.baseUrl}/export`, request, { params });
    }
    return this.http.post(`${this.baseUrl}/export`, request, {
      params,
      responseType: 'blob'
    });
  }

  getExportJobStatus(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/export-jobs/${jobId}`);
  }

  getSchedules(): Observable<ScheduleDTO[]> {
    return this.http.get<ScheduleDTO[]>(`${this.baseUrl}/schedules`);
  }

  getScheduleById(id: string): Observable<ScheduleDTO> {
    return this.http.get<ScheduleDTO>(`${this.baseUrl}/schedules/${id}`);
  }

  createSchedule(schedule: ScheduleDTO): Observable<ScheduleDTO> {
    return this.http.post<ScheduleDTO>(`${this.baseUrl}/schedules`, schedule);
  }

  updateSchedule(id: string, schedule: ScheduleDTO): Observable<ScheduleDTO> {
    return this.http.put<ScheduleDTO>(`${this.baseUrl}/schedules/${id}`, schedule);
  }

  deleteSchedule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/schedules/${id}`);
  }

  getAuditLogs(page: number = 0, size: number = 50): Observable<any> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<any>(`${this.baseUrl}/audit-logs`, { params });
  }
}
