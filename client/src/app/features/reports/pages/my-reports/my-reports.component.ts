import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../../core/services/report.service';
import { ExecutionResponse } from '../../../../core/models/report.models';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reports.component.html',
  styleUrl: './my-reports.component.scss'
})
export class MyReportsComponent implements OnInit {
  jobs: ExecutionResponse[] = [];
  isLoading = false;
  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.reportService.getMyReports().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.isLoading = false;
      },
      error: (err) => {
        this.statusMessage = err.error?.message || 'Failed to load execution history';
        this.statusType = 'error';
        this.isLoading = false;
      }
    });
  }

  downloadJobOutput(job: ExecutionResponse): void {
    this.statusMessage = `Downloading ${job.fileName || job.reportName}...`;
    this.statusType = 'info';

    this.reportService.downloadReport(job.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = job.fileName || `${job.reportName.replace(/[^a-zA-Z0-9_\-]/g, '_')}.${this.getFileExtension(job.format)}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.statusMessage = 'Download completed successfully.';
        this.statusType = 'success';
        setTimeout(() => this.statusMessage = '', 4000);
      },
      error: (err) => {
        this.statusMessage = err.error?.message || 'Failed to download report output.';
        this.statusType = 'error';
      }
    });
  }

  private getFileExtension(format?: string): string {
    if (!format) return 'pdf';
    const f = format.toLowerCase();
    if (f.includes('excel') || f.includes('xls')) return 'xlsx';
    if (f.includes('csv')) return 'csv';
    if (f.includes('dhtml') || f.includes('html')) return 'html';
    if (f.includes('rtf')) return 'rtf';
    return 'pdf';
  }
}
