import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ScheduleRequest, ScheduleResponse, ScheduleHistory, ReportSchedule } from '../models/schedule.models';
import { AuthorizationRequest } from '../models/delivery.models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private api: ApiService) {}

  getSchedules(status?: string): Observable<ScheduleResponse[]> {
    return this.api.get<ScheduleResponse[]>('/api/v1/schedules', status ? { status } : undefined);
  }

  getScheduleById(id: string): Observable<ScheduleResponse> {
    return this.api.get<ScheduleResponse>(`/api/v1/schedules/${id}`);
  }

  createSchedule(schedule: ScheduleRequest): Observable<ScheduleResponse> {
    return this.api.post<ScheduleResponse>('/api/v1/schedules', schedule);
  }

  authorizeSchedule(id: string, actionReq: AuthorizationRequest): Observable<ScheduleResponse> {
    return this.api.post<ScheduleResponse>(`/api/v1/schedules/${id}/authorize`, actionReq);
  }

  triggerSchedule(id: string): Observable<void> {
    return this.api.post<void>(`/api/v1/schedules/${id}/trigger`, {});
  }

  getScheduleHistory(scheduleId?: string): Observable<ScheduleHistory[]> {
    if (scheduleId) {
      return this.api.get<ScheduleHistory[]>(`/api/v1/schedules/${scheduleId}/history`);
    }
    // If no schedule id, query the first schedule or return empty observable
    return this.api.get<ScheduleHistory[]>('/api/v1/schedules/SCH-001/history');
  }

  deleteSchedule(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/schedules/${id}`);
  }
}
