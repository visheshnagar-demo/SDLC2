import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { GeneratedReport } from '../../../../core/models/report.models';
import { PendingRibbonComponent } from '../../../../shared/components/pending-ribbon/pending-ribbon.component';
import { ReportLookupModalComponent } from '../../components/report-lookup-modal/report-lookup-modal.component';

@Component({
  selector: 'app-reports-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PendingRibbonComponent, ReportLookupModalComponent],
  templateUrl: './reports-landing.component.html',
  styleUrl: './reports-landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsLandingComponent implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);

  reports = signal<GeneratedReport[]>([]);
  filteredReports = signal<GeneratedReport[]>([]);
  selectedReportIds = signal<Set<string>>(new Set());

  // Filter States
  selectedAccount = signal<string>('All Accounts (14 Linked)');
  postingWindow = signal<string>('Oct 01, 2024 - Oct 31, 2024');
  branchFilter = signal<string>('NYC-001');
  statusFilter = signal<string>('Status: All');
  formatFilter = signal<string>('MT940 / End of Day');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalReports = signal<number>(48);

  // Lookup modal
  isLookupOpen = signal<boolean>(false);
  previewReport = signal<GeneratedReport | null>(null);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getReports().subscribe(data => {
      this.reports.set(data);
      this.filteredReports.set(data);
      this.totalReports.set(data.length);
    });
  }

  applyFilters(): void {
    const list = this.reports().filter(r => {
      const matchStatus = this.statusFilter() === 'Status: All' ||
        (this.statusFilter() === 'Completed' && r.status === 'COMPLETED') ||
        (this.statusFilter() === 'Pending Approval' && r.status === 'PENDING_APPROVAL') ||
        (this.statusFilter() === 'Generating' && r.status === 'GENERATING') ||
        (this.statusFilter() === 'Failed / Rejected' && r.status === 'REJECTED');

      const matchBranch = !this.branchFilter() || (r.branchCode && r.branchCode.includes(this.branchFilter()));
      return matchStatus && matchBranch;
    });
    this.filteredReports.set(list);
  }

  resetFilters(): void {
    this.selectedAccount.set('All Accounts (14 Linked)');
    this.branchFilter.set('');
    this.statusFilter.set('Status: All');
    this.formatFilter.set('MT940 / End of Day');
    this.filteredReports.set(this.reports());
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      const allIds = new Set(this.filteredReports().map(r => r.id));
      this.selectedReportIds.set(allIds);
    } else {
      this.selectedReportIds.set(new Set());
    }
  }

  toggleReportSelection(id: string): void {
    const current = new Set(this.selectedReportIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedReportIds.set(current);
  }

  isReportSelected(id: string): boolean {
    return this.selectedReportIds().has(id);
  }

  downloadReport(report: GeneratedReport, format: string = 'PDF'): void {
    this.reportService.exportReport(report.id, format).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.reportName.replace(/\s+/g, '_')}_${report.id}.${format.toLowerCase()}`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  viewReportPreview(report: GeneratedReport): void {
    this.previewReport.set(report);
  }

  closePreview(): void {
    this.previewReport.set(null);
  }

  openLookup(): void {
    this.isLookupOpen.set(true);
  }

  closeLookup(): void {
    this.isLookupOpen.set(false);
  }

  navigateToCriteria(): void {
    this.router.navigate(['/criteria']);
  }
}
