import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MyReportsComponent } from './my-reports.component';
import { ReportService } from '../../../../core/services/report.service';
import { of, throwError } from 'rxjs';
import { ExecutionResponse } from '../../../../core/models/report.models';

describe('MyReportsComponent', () => {
  let component: MyReportsComponent;
  let fixture: ComponentFixture<MyReportsComponent>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ReportService', [
      'getMyReports',
      'downloadReport'
    ]);

    await TestBed.configureTestingModule({
      imports: [MyReportsComponent],
      providers: [
        { provide: ReportService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyReportsComponent);
    component = fixture.componentInstance;
    reportServiceSpy = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load report execution jobs on init from ReportService', () => {
    const mockJobs: ExecutionResponse[] = [
      {
        id: 'exec-1',
        reportName: 'Account Statement – Comprehensive',
        executionTimeGmt: '2026-01-01T10:00:00Z',
        format: 'Adobe(PDF)',
        status: 'COMPLETED',
        fileName: 'Account_Statement_Comprehensive.pdf',
        recordsCount: 7,
        downloadUrl: '/api/v1/reports/my-reports/exec-1/download'
      }
    ];

    reportServiceSpy.getMyReports.and.returnValue(of(mockJobs));

    fixture.detectChanges();

    expect(component.jobs.length).toBe(1);
    expect(component.jobs[0].id).toBe('exec-1');
    expect(reportServiceSpy.getMyReports).toHaveBeenCalled();
  });

  it('should call reportService.downloadReport when download button is clicked', () => {
    const job: ExecutionResponse = {
      id: 'exec-1',
      reportName: 'Account Statement – Comprehensive',
      executionTimeGmt: '2026-01-01T10:00:00Z',
      format: 'Adobe(PDF)',
      status: 'COMPLETED',
      fileName: 'Account_Statement_Comprehensive.pdf',
      recordsCount: 7,
      downloadUrl: '/api/v1/reports/my-reports/exec-1/download'
    };

    const dummyBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    reportServiceSpy.downloadReport.and.returnValue(of(dummyBlob));

    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:http://localhost/test-uuid');
    spyOn(window.URL, 'revokeObjectURL');

    component.downloadJobOutput(job);

    expect(reportServiceSpy.downloadReport).toHaveBeenCalledWith('exec-1');
  });

  it('should surface error message if report download fails', () => {
    const job: ExecutionResponse = {
      id: 'exec-1',
      reportName: 'Account Statement – Comprehensive',
      executionTimeGmt: '2026-01-01T10:00:00Z',
      format: 'Adobe(PDF)',
      status: 'COMPLETED',
      fileName: 'Account_Statement_Comprehensive.pdf',
      recordsCount: 7,
      downloadUrl: '/api/v1/reports/my-reports/exec-1/download'
    };

    reportServiceSpy.downloadReport.and.returnValue(throwError(() => ({ message: 'Network error' })));

    component.downloadJobOutput(job);

    expect(component.statusType).toBe('error');
    expect(component.statusMessage).toContain('Failed to download report output.');
  });
});
