import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockHttpService } from './mock-http.service';
import { MigrationJob, MigrationLogEntry } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MigrateService {
  constructor(private mockHttp: MockHttpService) {}

  getMigrationJobs(): Observable<MigrationJob[]> {
    return this.mockHttp.getMigrationJobs();
  }

  approveMigrationJob(jobId: string, approverName: string): Observable<{ success: boolean; job: MigrationJob }> {
    return this.mockHttp.approveMigrationJob(jobId, approverName);
  }

  rejectMigrationJob(jobId: string, reason: string): Observable<{ success: boolean; job: MigrationJob }> {
    return this.mockHttp.rejectMigrationJob(jobId, reason);
  }

  triggerMigrationRun(jobId: string): Observable<{ success: boolean; message: string }> {
    return this.mockHttp.triggerMigrationRun(jobId);
  }

  getMigrationLogs(batchId: string): Observable<MigrationLogEntry[]> {
    return this.mockHttp.getMigrationLogs(batchId);
  }

  streamLiveLogs(batchId: string): Observable<MigrationLogEntry> {
    return this.mockHttp.streamLiveLogs(batchId);
  }
}
