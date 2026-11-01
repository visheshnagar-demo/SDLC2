import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ReportSchedule, ScheduleHistory } from '../models/schedule.models';
import { MakerCheckerActionRequest } from '../models/delivery.models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private api: ApiService) {}

  getSchedules(tab?: string): Observable<ReportSchedule[]> {
    return this.api.get<ReportSchedule[]>('/api/v1/schedules', { tab }).pipe(
      catchError(() => of(this.getMockSchedules(tab)))
    );
  }

  createSchedule(schedule: Partial<ReportSchedule>): Observable<ReportSchedule> {
    return this.api.post<ReportSchedule>('/api/v1/schedules', schedule).pipe(
      catchError(() => {
        const created: ReportSchedule = {
          id: 'SCH-' + Date.now(),
          scheduleReferenceId: 'SCH-REF-' + Math.floor(1000 + Math.random() * 9000),
          scheduleName: schedule.scheduleName || 'New Schedule',
          eventType: 'Report',
          eventName: schedule.eventName || 'Account Statement – Comprehensive',
          serviceClassId: 'Cash Statements Reports',
          scheduleInterval: schedule.scheduleInterval || 'EVERY_1_OR_MORE_DAYS',
          holidayOption: schedule.holidayOption || 'RUN_NEXT_BUSINESS_DAY',
          runTimeUser: schedule.runTimeUser || '',
          derivedReportId: schedule.derivedReportId,
          deliveryOptionId: schedule.deliveryOptionId,
          deliveryOptionName: schedule.deliveryOptionName || 'DAILY_TREASURY_EMAIL',
          runStartDate: schedule.runStartDate || '2023-01-25',
          runStartTime: schedule.runStartTime || '07:30',
          runEveryDays: schedule.runEveryDays || 1,
          isDailyIntraDay: !!schedule.isDailyIntraDay,
          intraDayInterval: schedule.intraDayInterval || '01:00:00',
          intraDayEndTime: schedule.intraDayEndTime || '17:30',
          authStatus: 'PENDING_AUTHORIZATION',
          makerId: 'USR-101',
          makerName: 'JUSTIN,JOHN',
          createdAt: new Date().toISOString(),
          nextRunTime: '2023-01-25 07:30:00 GMT'
        };
        return of(created);
      })
    );
  }

  authorizeSchedule(id: string, actionReq: MakerCheckerActionRequest): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/api/v1/schedules/${id}/authorize`, actionReq).pipe(
      catchError(() => of({
        success: true,
        message: `Schedule status updated to ${actionReq.action}`
      }))
    );
  }

  getExecutionHistory(scheduleId?: string): Observable<ScheduleHistory[]> {
    return this.api.get<ScheduleHistory[]>('/api/v1/schedules/history', { scheduleId }).pipe(
      catchError(() => of(this.getMockHistory()))
    );
  }

  getMockSchedules(tab?: string): ReportSchedule[] {
    const list: ReportSchedule[] = [
      {
        id: 'SCH-001',
        scheduleReferenceId: 'SCH-2023-0012',
        scheduleName: 'DAILY_GBP_COMPREHENSIVE_STATEMENT',
        eventType: 'Report',
        eventName: 'Account Statement – Comprehensive',
        serviceClassId: 'Cash Statements Reports',
        scheduleInterval: 'EVERY_1_OR_MORE_DAYS',
        holidayOption: 'RUN_NEXT_BUSINESS_DAY',
        runTimeUser: 'SYSTEM_AUTORUN',
        derivedReportId: 'CRIT-001',
        deliveryOptionId: 'DEL-001',
        deliveryOptionName: 'DAILY_TREASURY_EMAIL',
        runStartDate: '2023-01-12',
        runStartTime: '07:30',
        runEveryDays: 1,
        isDailyIntraDay: true,
        intraDayInterval: '01:00:00',
        intraDayEndTime: '17:30',
        authStatus: 'AUTHORIZED',
        makerId: 'USR-101',
        makerName: 'JUSTIN,JOHN',
        authorizerId: 'USR-202',
        authorizerName: 'SMITH,SARAH',
        createdAt: '2023-01-11 15:30:00 GMT',
        nextRunTime: '2023-01-23 07:30:00 GMT'
      },
      {
        id: 'SCH-002',
        scheduleReferenceId: 'SCH-2023-0015',
        scheduleName: 'WEEKLY_AUDIT_CSV_EXTRACT',
        eventType: 'Report',
        eventName: 'Account Statement – Comprehensive',
        serviceClassId: 'Cash Statements Reports',
        scheduleInterval: 'EVERY_1_OR_MORE_WEEKS',
        holidayOption: 'RUN_ALL_DAYS',
        runTimeUser: '',
        derivedReportId: 'CRIT-002',
        deliveryOptionId: 'DEL-002',
        deliveryOptionName: 'AUDIT_CSV_FEED',
        runStartDate: '2023-01-15',
        runStartTime: '06:00',
        runEveryDays: 7,
        isDailyIntraDay: false,
        authStatus: 'PENDING_AUTHORIZATION',
        makerId: 'USR-101',
        makerName: 'JUSTIN,JOHN',
        createdAt: '2023-01-20 18:00:00 GMT',
        nextRunTime: 'Pending Authorization'
      }
    ];

    if (tab === 'TO_AUTHORIZE') {
      return list.filter(s => s.authStatus === 'PENDING_AUTHORIZATION');
    }
    return list;
  }

  getMockHistory(): ScheduleHistory[] {
    return [
      {
        id: 'HIST-001',
        scheduleId: 'SCH-001',
        scheduleName: 'DAILY_GBP_COMPREHENSIVE_STATEMENT',
        eventName: 'Account Statement – Comprehensive',
        executionTimeGmt: '2023-01-22 07:30:02 GMT',
        status: 'COMPLETED',
        recordsProcessed: 7,
        deliveryStatus: 'DELIVERED (MailHog SMTP Sink)',
        recipients: 'treasury.ops@client.com',
        durationMs: 420
      },
      {
        id: 'HIST-002',
        scheduleId: 'SCH-001',
        scheduleName: 'DAILY_GBP_COMPREHENSIVE_STATEMENT',
        eventName: 'Account Statement – Comprehensive',
        executionTimeGmt: '2023-01-22 08:30:01 GMT',
        status: 'COMPLETED',
        recordsProcessed: 7,
        deliveryStatus: 'DELIVERED (MailHog SMTP Sink)',
        recipients: 'treasury.ops@client.com',
        durationMs: 380
      },
      {
        id: 'HIST-003',
        scheduleId: 'SCH-001',
        scheduleName: 'DAILY_GBP_COMPREHENSIVE_STATEMENT',
        eventName: 'Account Statement – Comprehensive',
        executionTimeGmt: '2023-01-22 09:30:00 GMT',
        status: 'COMPLETED',
        recordsProcessed: 7,
        deliveryStatus: 'DELIVERED (MailHog SMTP Sink)',
        recipients: 'treasury.ops@client.com',
        durationMs: 410
      }
    ];
  }
}
