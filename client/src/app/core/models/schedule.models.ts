export interface ReportSchedule {
  id: string;
  scheduleReferenceId: string;
  scheduleName: string;
  eventType: string;
  eventName: string;
  serviceClassId: string;
  scheduleInterval: 'ONCE' | 'EVERY_1_OR_MORE_DAYS' | 'EVERY_1_OR_MORE_WEEKS' | 'EVERY_1_OR_MORE_MONTHS' | 'EVENT_BASED';
  holidayOption: 'RUN_ALL_DAYS' | 'RUN_NEXT_BUSINESS_DAY' | 'RUN_PREV_BUSINESS_DAY';
  runTimeUser?: string;
  derivedReportId?: string;
  deliveryOptionId?: string;
  deliveryOptionName?: string;
  runStartDate: string;
  runStartTime: string;
  runEveryDays: number;
  isDailyIntraDay: boolean;
  intraDayInterval?: string;
  intraDayEndTime?: string;
  authStatus: 'PENDING_AUTHORIZATION' | 'AUTHORIZED' | 'PENDING_REPAIR' | 'REJECTED';
  makerId: string;
  makerName: string;
  authorizerId?: string;
  authorizerName?: string;
  authorizerComment?: string;
  createdAt: string;
  nextRunTime?: string;
}

export interface ScheduleHistory {
  id: string;
  scheduleId: string;
  scheduleName: string;
  eventName: string;
  executionTimeGmt: string;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED';
  recordsProcessed: number;
  deliveryStatus: string;
  recipients: string;
  durationMs: number;
  errorMessage?: string;
}
