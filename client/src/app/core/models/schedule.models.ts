export interface ScheduleRequest {
  scheduleName: string;
  eventType?: string;
  eventName: string;
  derivedReportId?: string;
  deliveryOptionId: string;
  intervalType: string;
  intervalConfig?: Record<string, any>;
  holidayOption?: string;
  runTimeUser?: string;
}

export interface ScheduleResponse {
  id: string;
  scheduleReferenceId: string;
  scheduleName: string;
  eventType: string;
  eventName: string;
  derivedReportId?: string;
  deliveryOptionId: string;
  deliveryOptionName?: string;
  intervalType: string;
  scheduleInterval?: string;
  intervalConfig?: Record<string, any>;
  runStartTime?: string;
  holidayOption: string;
  runTimeUser?: string;
  authStatus: 'PENDING_AUTHORIZATION' | 'AUTHORIZED' | 'PENDING_REPAIR' | 'REPAIR_REQUIRED' | 'REJECTED' | string;
  makerId?: string;
  makerUsername?: string;
  makerName?: string;
  checkerId?: string;
  checkerUsername?: string;
  rejectionReason?: string;
  nextRunTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSchedule {
  id: string;
  scheduleReferenceId: string;
  scheduleName: string;
  eventType: string;
  eventName: string;
  serviceClassId?: string;
  scheduleInterval?: 'ONCE' | 'EVERY_1_OR_MORE_DAYS' | 'EVERY_1_OR_MORE_WEEKS' | 'EVERY_1_OR_MORE_MONTHS' | 'EVENT_BASED' | string;
  intervalType?: string;
  intervalConfig?: Record<string, any>;
  holidayOption: 'RUN_ALL_DAYS' | 'RUN_NEXT_BUSINESS_DAY' | 'RUN_PREV_BUSINESS_DAY' | string;
  runTimeUser?: string;
  derivedReportId?: string;
  deliveryOptionId?: string;
  deliveryOptionName?: string;
  runStartDate?: string;
  runStartTime?: string;
  runEveryDays?: number;
  isDailyIntraDay?: boolean;
  intraDayInterval?: string;
  intraDayEndTime?: string;
  authStatus: 'PENDING_AUTHORIZATION' | 'AUTHORIZED' | 'PENDING_REPAIR' | 'REPAIR_REQUIRED' | 'REJECTED' | string;
  makerId?: string;
  makerUsername?: string;
  makerName?: string;
  checkerId?: string;
  checkerUsername?: string;
  authorizerId?: string;
  authorizerName?: string;
  authorizerComment?: string;
  rejectionReason?: string;
  createdAt?: string;
  nextRunTime?: string;
}

export interface ScheduleHistory {
  id: string;
  scheduleId: string;
  scheduleName: string;
  eventName?: string;
  executionTimeGmt: string;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | string;
  recordsProcessed: number;
  deliveryStatus: string;
  recipients?: string;
  durationMs: number;
  errorMessage?: string;
}
