import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MigrateService } from '../../core/services/migrate.service';
import { MigrationJob, MigrationLogEntry } from '../../core/models/models';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { LogStreamComponent } from '../../shared/components/log-stream/log-stream.component';

@Component({
  selector: 'app-migrate-queue',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    ProgressBarComponent,
    ConfirmModalComponent,
    LogStreamComponent
  ],
  templateUrl: './migrate.component.html',
  styleUrls: ['./migrate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrateComponent implements OnInit, OnDestroy {
  jobs: MigrationJob[] = [];
  logs: MigrationLogEntry[] = [];
  selectedJobForApproval: MigrationJob | null = null;
  approvalModalOpen = false;
  activeBatchId = 'BATCH-LIVE-01';
  isStreaming = false;
  private streamSub?: Subscription;

  constructor(
    private migrateService: MigrateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadInitialLogs(this.activeBatchId);
  }

  ngOnDestroy(): void {
    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }
  }

  loadJobs(): void {
    this.migrateService.getMigrationJobs().subscribe(jobs => {
      this.jobs = jobs;
      this.cdr.markForCheck();
    });
  }

  loadInitialLogs(batchId: string): void {
    this.activeBatchId = batchId;
    this.migrateService.getMigrationLogs(batchId).subscribe(logs => {
      this.logs = logs;
      this.cdr.markForCheck();
    });
  }

  openApprovalModal(job: MigrationJob): void {
    this.selectedJobForApproval = job;
    this.approvalModalOpen = true;
    this.cdr.markForCheck();
  }

  closeApprovalModal(): void {
    this.approvalModalOpen = false;
    this.selectedJobForApproval = null;
    this.cdr.markForCheck();
  }

  onConfirmApproval(): void {
    if (!this.selectedJobForApproval) return;
    const jobId = this.selectedJobForApproval.jobId;
    this.migrateService.approveMigrationJob(jobId, 'Citi Lead Architect (HITL Gate)').subscribe(() => {
      this.closeApprovalModal();
      this.loadJobs();
      this.triggerLiveStream(jobId);
    });
  }

  triggerLiveStream(batchId: string): void {
    this.isStreaming = true;
    this.activeBatchId = batchId;
    this.loadInitialLogs(batchId);

    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }

    this.streamSub = this.migrateService.streamLiveLogs(batchId).subscribe({
      next: (log) => {
        this.logs = [...this.logs, log];
        this.cdr.markForCheck();
      },
      complete: () => {
        this.isStreaming = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearLogs(): void {
    this.logs = [];
    this.cdr.markForCheck();
  }

  downloadLogs(): void {
    const text = this.logs.map(l => `[${l.timestamp}] [${l.level}] [${l.phase}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-log-${this.activeBatchId}.log`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getApprovalModalDetails(): { label: string; value: string }[] {
    if (!this.selectedJobForApproval) return [];
    return [
      { label: 'Job ID', value: this.selectedJobForApproval.jobId },
      { label: 'Report ID', value: this.selectedJobForApproval.reportId },
      { label: 'Priority', value: this.selectedJobForApproval.priority },
      { label: 'Total Records', value: this.selectedJobForApproval.totalRecords.toLocaleString() }
    ];
  }
}
