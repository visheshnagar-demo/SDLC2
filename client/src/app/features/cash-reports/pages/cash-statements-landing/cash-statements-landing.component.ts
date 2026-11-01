import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { BaseReport, StatementReportData } from '../../../../core/models/report.models';
import { BaseReportLookupModalComponent } from '../../components/base-report-lookup-modal/base-report-lookup-modal.component';
import { ReportViewerModalComponent } from '../../../../shared/components/report-viewer-modal/report-viewer-modal.component';
import { BinocularLookupInputComponent } from '../../../../shared/components/binocular-lookup-input/binocular-lookup-input.component';

@Component({
  selector: 'app-cash-statements-landing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BaseReportLookupModalComponent,
    ReportViewerModalComponent,
    BinocularLookupInputComponent
  ],
  templateUrl: './cash-statements-landing.component.html',
  styleUrl: './cash-statements-landing.component.scss'
})
export class CashStatementsLandingComponent implements OnInit {
  isSearchCriteriaCollapsed = false;
  activeTab: 'GENERATE' | 'VIEW_AVAILABLE' = 'GENERATE';

  // Search criteria form fields
  searchCategory = 'Cash Statements Reports';
  searchReportType = 'All Reports';
  searchBaseReportName = '';

  // Data
  allReports: BaseReport[] = [];
  selectedReports: Set<string> = new Set();
  isAllSelected = false;

  // Pagination & Sorting
  currentPage = 1;
  pageSize = 20;
  sortField = 'reportName';
  sortAsc = true;

  // Lookups & Viewers
  showLookupModal = false;
  showViewerModal = false;
  activeReportData: StatementReportData | null = null;
  activeCriteria: any = null;

  asOfTimestamp = '';

  constructor(
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshTimestamp();
    this.loadReports();
  }

  refreshTimestamp(): void {
    const now = new Date();
    this.asOfTimestamp = now.toUTCString().replace('GMT', '').trim() + ' GMT';
  }

  loadReports(): void {
    this.reportService.getBaseReports().subscribe(reports => {
      this.allReports = reports;
    });
  }

  get filteredReports(): BaseReport[] {
    let result = [...this.allReports];

    if (this.searchBaseReportName.trim()) {
      const q = this.searchBaseReportName.toLowerCase();
      result = result.filter(r =>
        r.reportName.toLowerCase().includes(q) ||
        r.baseReportName.toLowerCase().includes(q)
      );
    }

    if (this.searchCategory && this.searchCategory !== 'All Categories') {
      result = result.filter(r => r.category === this.searchCategory);
    }

    if (this.searchReportType && this.searchReportType !== 'All Reports') {
      result = result.filter(r => r.reportType === this.searchReportType);
    }

    result.sort((a: any, b: any) => {
      const valA = a[this.sortField] || '';
      const valB = b[this.sortField] || '';
      const cmp = String(valA).localeCompare(String(valB));
      return this.sortAsc ? cmp : -cmp;
    });

    return result;
  }

  get paginatedReports(): BaseReport[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReports.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReports.length / this.pageSize) || 1;
  }

  toggleSearchCriteria(): void {
    this.isSearchCriteriaCollapsed = !this.isSearchCriteriaCollapsed;
  }

  onResetSearch(): void {
    this.searchCategory = 'Cash Statements Reports';
    this.searchReportType = 'All Reports';
    this.searchBaseReportName = '';
  }

  openBaseReportLookup(): void {
    this.showLookupModal = true;
  }

  onBaseReportSelected(report: BaseReport): void {
    this.searchBaseReportName = report.reportName;
    this.showLookupModal = false;
  }

  toggleFavorite(report: BaseReport, event: MouseEvent): void {
    event.stopPropagation();
    report.isFavorite = !report.isFavorite;
  }

  toggleSelectAll(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.isAllSelected = checked;
    this.selectedReports.clear();
    if (checked) {
      this.paginatedReports.forEach(r => this.selectedReports.add(r.id));
    }
  }

  toggleSelectReport(id: string, e: Event): void {
    e.stopPropagation();
    if (this.selectedReports.has(id)) {
      this.selectedReports.delete(id);
    } else {
      this.selectedReports.add(id);
    }
    this.isAllSelected = this.selectedReports.size === this.paginatedReports.length;
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
  }

  navigateToCriteria(report: BaseReport): void {
    this.router.navigate(['/reports/criteria', report.id]);
  }

  onQuickRun(report: BaseReport, event: MouseEvent): void {
    event.stopPropagation();
    const defaults = this.reportService.getMockCriteriaDefaults();
    this.activeCriteria = defaults;
    this.reportService.runReport(defaults).subscribe(data => {
      this.activeReportData = data;
      this.showViewerModal = true;
    });
  }

  onQuickSchedule(report: BaseReport, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/scheduling'], { queryParams: { reportName: report.reportName } });
  }

  showMeHow(): void {
    alert('How to Generate Cash Statements:\n1. Locate your desired report (e.g. Account Statement – Comprehensive).\n2. Click the Report Name to configure criteria.\n3. Click "Run" to view immediately or "Schedule" for automated recurring delivery.');
  }
}
