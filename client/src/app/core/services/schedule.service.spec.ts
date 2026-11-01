import { TestBed } from '@angular/core/testing';
import { ScheduleService } from './schedule.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { ScheduleRequest, ScheduleResponse, ScheduleHistory } from '../models/schedule.models';
import { AuthorizationRequest } from '../models/delivery.models';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', [
      'get',
      'post',
      'put',
      'delete'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ScheduleService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(ScheduleService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch schedules from /api/v1/schedules', (done) => {
    const mockSchedules: ScheduleResponse[] = [
      {
        id: 'sch-1',
        scheduleReferenceId: 'SCH-REF-001',
        scheduleName: 'DAILY_GBP_STATEMENT',
        eventType: 'Report',
        eventName: 'Account Statement – Comprehensive',
        deliveryOptionId: 'del-1',
        intervalType: 'DAILY',
        holidayOption: 'RUN_NEXT_BUSINESS_DAY',
        authStatus: 'AUTHORIZED',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      }
    ];

    apiSpy.get.and.returnValue(of(mockSchedules));

    service.getSchedules().subscribe((schedules) => {
      expect(schedules).toEqual(mockSchedules);
      expect(apiSpy.get).toHaveBeenCalledWith('/api/v1/schedules', undefined);
      done();
    });
  });

  it('should create schedule via POST /api/v1/schedules', (done) => {
    const request: ScheduleRequest = {
      scheduleName: 'DAILY_GBP_STATEMENT',
      eventType: 'Report',
      eventName: 'Account Statement – Comprehensive',
      deliveryOptionId: 'del-1',
      intervalType: 'DAILY',
      holidayOption: 'RUN_NEXT_BUSINESS_DAY',
      intervalConfig: {
        startDate: '2023-01-25',
        startTime: '07:30',
        everyDays: 1
      }
    };

    const mockResponse: ScheduleResponse = {
      id: 'sch-1',
      scheduleReferenceId: 'SCH-REF-001',
      scheduleName: 'DAILY_GBP_STATEMENT',
      eventType: 'Report',
      eventName: 'Account Statement – Comprehensive',
      deliveryOptionId: 'del-1',
      intervalType: 'DAILY',
      holidayOption: 'RUN_NEXT_BUSINESS_DAY',
      authStatus: 'PENDING_AUTHORIZATION',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    apiSpy.post.and.returnValue(of(mockResponse));

    service.createSchedule(request).subscribe((res) => {
      expect(res.id).toBe('sch-1');
      expect(apiSpy.post).toHaveBeenCalledWith('/api/v1/schedules', request);
      done();
    });
  });

  it('should authorize schedule via POST /api/v1/schedules/{id}/authorize', (done) => {
    const authReq: AuthorizationRequest = {
      action: 'AUTHORIZE',
      comment: 'Approved'
    };

    const mockResponse: ScheduleResponse = {
      id: 'sch-1',
      scheduleReferenceId: 'SCH-REF-001',
      scheduleName: 'DAILY_GBP_STATEMENT',
      eventType: 'Report',
      eventName: 'Account Statement – Comprehensive',
      deliveryOptionId: 'del-1',
      intervalType: 'DAILY',
      holidayOption: 'RUN_NEXT_BUSINESS_DAY',
      authStatus: 'AUTHORIZED',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    apiSpy.post.and.returnValue(of(mockResponse));

    service.authorizeSchedule('sch-1', authReq).subscribe((res) => {
      expect(res.authStatus).toBe('AUTHORIZED');
      expect(apiSpy.post).toHaveBeenCalledWith('/api/v1/schedules/sch-1/authorize', authReq);
      done();
    });
  });
});
