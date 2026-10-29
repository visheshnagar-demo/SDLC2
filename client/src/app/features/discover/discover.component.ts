import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscoverService } from '../../core/services/discover.service';
import { LegacyReport, ReportDetail } from '../../core/models/models';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';
import { SlideDrawerComponent } from '../../shared/components/slide-drawer/slide-drawer.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ReadinessScoreComponent } from '../../shared/components/readiness-score/readiness-score.component';

@Component({
  selector: 'app-discover-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    SlideDrawerComponent,
    StatusBadgeComponent,
    ReadinessScoreComponent
  ],
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverComponent implements OnInit {
  reports: LegacyReport[] = [];
  selectedReportDetail: ReportDetail | null = null;
  drawerOpen = false;

  // Filters
  selectedBU = 'ALL';
  selectedComplexity = 'ALL';
  selectedStatus = 'ALL';

  columns: ColumnDef[] = [
    { key: 'id', label: 'Report ID', sortable: true, type: 'code', width: '120px' },
    { key: 'title', label: 'Report Title & Domain', sortable: true, type: 'text' },
    { key: 'businessUnit', label: 'Business Unit', sortable: true, type: 'text', width: '160px' },
    { key: 'sourceSystem', label: 'Source System', sortable: true, type: 'text', width: '180px' },
    { key: 'complexityScore', label: 'Complexity', sortable: true, type: 'badge', width: '120px' },
    { key: 'readinessScore', label: 'Readiness', sortable: true, type: 'score', width: '140px' },
    { key: 'status', label: 'Lifecycle Status', sortable: true, type: 'badge', width: '150px' },
    { key: 'action', label: 'Inspect', type: 'action', width: '90px' }
  ];

  constructor(
    private discoverService: DiscoverService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.discoverService.getReportCatalog().subscribe(data => {
      this.reports = data;
      this.cdr.markForCheck();
    });
  }

  get filteredReports(): LegacyReport[] {
    return this.reports.filter(r => {
      const matchBU = this.selectedBU === 'ALL' || r.businessUnit === this.selectedBU;
      const matchComp = this.selectedComplexity === 'ALL' || r.complexityScore === this.selectedComplexity;
      const matchStat = this.selectedStatus === 'ALL' || r.status === this.selectedStatus;
      return matchBU && matchComp && matchStat;
    });
  }

  onSelectReport(report: LegacyReport): void {
    this.discoverService.getReportDetail(report.id).subscribe(detail => {
      this.selectedReportDetail = detail;
      this.drawerOpen = true;
      this.cdr.markForCheck();
    });
  }

  onTableAction(event: { action: string; row: any }): void {
    this.onSelectReport(event.row);
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.cdr.markForCheck();
  }
}
