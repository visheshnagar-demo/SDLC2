import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../../core/services/report.service';
import { ExecutionJob } from '../../../../core/models/report.models';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reports.component.html',
  styleUrl: './my-reports.component.scss'
})
export class MyReportsComponent implements OnInit {
  jobs: ExecutionJob[] = [];
  isLoading = false;

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
      error: () => {
        this.isLoading = false;
      }
    });
  }

  downloadJobOutput(job: ExecutionJob): void {
    const dummyContent = `CITIDIRECT - Report Output\nJob ID: ${job.jobId}\nReport: ${job.reportName}\nFormat: ${job.format}\nStatus: ${job.status}`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.jobId}_Output.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
