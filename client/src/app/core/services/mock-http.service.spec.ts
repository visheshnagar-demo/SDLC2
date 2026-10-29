import { TestBed } from '@angular/core/testing';
import { MockHttpService } from './mock-http.service';

describe('MockHttpService', () => {
  let service: MockHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return executive KPIs with totalReports > 200,000', (done) => {
    service.getExecutiveKPIs().subscribe((kpis) => {
      expect(kpis.totalReports).toBeGreaterThan(200000);
      expect(kpis.overallCompletionPercentage).toBeGreaterThan(0);
      done();
    });
  });

  it('should return report catalog with legacy reports', (done) => {
    service.getReportCatalog().subscribe((reports) => {
      expect(reports.length).toBeGreaterThan(0);
      expect(reports[0].id).toBeDefined();
      expect(reports[0].sourceSystem).toContain('CitiVelocity');
      done();
    });
  });

  it('should return transform workspace data', (done) => {
    service.getTransformWorkspace('REP-10492').subscribe((ws) => {
      expect(ws.aiConfidence).toBeGreaterThanOrEqual(90);
      expect(ws.mappings.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return validation queue', (done) => {
    service.getValidationQueue().subscribe((queue) => {
      expect(queue.length).toBeGreaterThan(0);
      expect(queue[0].metadataChecks.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should return migration jobs and allow approval', (done) => {
    service.getMigrationJobs().subscribe((jobs) => {
      expect(jobs.length).toBeGreaterThan(0);
      const targetJob = jobs[0];
      service.approveMigrationJob(targetJob.jobId, 'Test Reviewer').subscribe((res) => {
        expect(res.success).toBeTrue();
        expect(res.job.approvalStatus).toBe('APPROVED');
        done();
      });
    });
  });
});
