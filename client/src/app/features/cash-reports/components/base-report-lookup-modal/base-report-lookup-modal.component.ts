import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { BaseReport } from '../../../../core/models/report.models';

@Component({
  selector: 'app-base-report-lookup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-report-lookup-modal.component.html',
  styleUrl: './base-report-lookup-modal.component.scss'
})
export class BaseReportLookupModalComponent implements OnInit {
  @Output() selectReport = new EventEmitter<BaseReport>();
  @Output() close = new EventEmitter<void>();

  searchCategory = 'Cash Statements Reports';
  searchReportType = 'All Reports';
  searchKeyword = '';

  reports: BaseReport[] = [];
  selectedReport: BaseReport | null = null;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getBaseReports().subscribe(reports => {
      this.reports = reports;
    });
  }

  get filteredReports(): BaseReport[] {
    let result = [...this.reports];

    if (this.searchCategory && this.searchCategory !== 'All Categories') {
      result = result.filter(r => r.category === this.searchCategory);
    }

    if (this.searchReportType && this.searchReportType !== 'All Reports') {
      result = result.filter(r => r.reportType === this.searchReportType);
    }

    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase();
      result = result.filter(r =>
        r.reportName.toLowerCase().includes(q) ||
        r.baseReportName.toLowerCase().includes(q)
      );
    }

    return result;
  }

  onRowClick(report: BaseReport): void {
    this.selectedReport = report;
  }

  onRowDoubleClick(report: BaseReport): void {
    this.selectedReport = report;
    this.confirm();
  }

  confirm(): void {
    if (this.selectedReport) {
      this.selectReport.emit(this.selectedReport);
    }
  }

  onReset(): void {
    this.searchCategory = 'Cash Statements Reports';
    this.searchReportType = 'All Reports';
    this.searchKeyword = '';
  }

  onClose(): void {
    this.close.emit();
  }
}
