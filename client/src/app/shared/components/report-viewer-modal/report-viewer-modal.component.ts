import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { StatementReportData, ReportCriteria } from '../../../core/models/report.models';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-report-viewer-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './report-viewer-modal.component.html',
  styleUrl: './report-viewer-modal.component.scss'
})
export class ReportViewerModalComponent {
  @Input() data!: StatementReportData;
  @Input() criteria!: ReportCriteria;
  @Output() close = new EventEmitter<void>();

  isDownloading = false;

  constructor(private reportService: ReportService) {}

  onClose(): void {
    this.close.emit();
  }

  downloadFormat(format: string): void {
    this.isDownloading = true;
    this.reportService.exportReportFile(this.criteria, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = format.toLowerCase().includes('pdf') ? 'pdf' :
                    format.toLowerCase().includes('csv') ? 'csv' :
                    format.toLowerCase().includes('excel') || format.toLowerCase().includes('xls') ? 'xlsx' :
                    format.toLowerCase().includes('rtf') ? 'rtf' : 'html';
        a.download = `Account_Statement_Comprehensive.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
      },
      error: () => {
        this.isDownloading = false;
      }
    });
  }

  printReport(): void {
    window.print();
  }
}
