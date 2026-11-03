import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ReportItem, LookupItem } from '../../../../core/models/report.models';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { LookupModalComponent } from '../lookup-modal/lookup-modal.component';

@Component({
  selector: 'app-landing-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbComponent, LookupModalComponent],
  template: `
    <div class="landing-grid-page">
      <app-breadcrumb currentSection="Cash Statement Reports"></app-breadcrumb>

      <!-- Page Header Banner -->
      <section class="citi-banner-header">
        <div class="banner-content">
          <h2>Cash Statement Reports — Corporate Inquiries &amp; Statements</h2>
          <p class="banner-subtext">View, filter, generate on-demand statements, and dispatch to multi-channel destinations.</p>
        </div>
        <div class="banner-actions">
          <button class="citi-btn-primary" (click)="navigateToCriteria()">
            + New Statement Criteria
          </button>
        </div>
      </section>

      <!-- Search & Filter Controls -->
      <section class="citi-filter-card">
        <div class="filter-grid">
          <div class="citi-form-group">
            <label>Branch Code</label>
            <div class="input-with-button">
              <input type="text" [(ngModel)]="filterBranch" placeholder="All Branches" />
              <button class="lookup-btn" (click)="openLookup('BRANCHES')" title="Lookup Branch">&#128065;</button>
            </div>
          </div>

          <div class="citi-form-group">
            <label>Customer ID</label>
            <div class="input-with-button">
              <input type="text" [(ngModel)]="filterCustomer" placeholder="All Customers" />
              <button class="lookup-btn" (click)="openLookup('CUSTOMERS')" title="Lookup Customer">&#128065;</button>
            </div>
          </div>

          <div class="citi-form-group">
            <label>Account Number</label>
            <div class="input-with-button">
              <input type="text" [(ngModel)]="filterAccount" placeholder="Filter Account..." />
              <button class="lookup-btn" (click)="openLookup('ACCOUNTS')" title="Lookup Account">&#128065;</button>
            </div>
          </div>

          <div class="citi-form-group">
            <label>Report Status</label>
            <select [(ngModel)]="filterStatus">
              <option value="">-- All Statuses --</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div class="filter-actions">
            <button class="citi-btn-primary" (click)="applyFilters()">Search</button>
            <button class="citi-btn-secondary" (click)="resetFilters()">Reset</button>
          </div>
        </div>
      </section>

      <!-- Table Section -->
      <section class="table-section">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <span class="record-counter">Showing <strong>{{ reports().length }}</strong> reports</span>
          </div>
          <div class="toolbar-right">
            <button class="export-chip" (click)="exportSelected('PDF')" [disabled]="!selectedReportId()">Export PDF</button>
            <button class="export-chip" (click)="exportSelected('EXCEL')" [disabled]="!selectedReportId()">Export Excel</button>
            <button class="export-chip" (click)="exportSelected('CSV')" [disabled]="!selectedReportId()">Export CSV</button>
          </div>
        </div>

        <div class="citi-table-container">
          <table class="citi-data-table">
            <thead>
              <tr>
                <th style="width: 36px; text-align: center;">
                  <input type="checkbox" (change)="toggleSelectAll($event)" />
                </th>
                <th>Base Report Name 1▲</th>
                <th>Report Type</th>
                <th>Branch Code</th>
                <th>Customer ID</th>
                <th>Account Number</th>
                <th>Currency</th>
                <th>Last Run Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (report of reports(); track report.id) {
                <tr [class.selected]="selectedReportId() === report.id" (click)="selectReport(report)">
                  <td style="text-align: center;">
                    <input 
                      type="checkbox" 
                      [checked]="selectedReportId() === report.id" 
                      (click)="$event.stopPropagation(); selectReport(report)" />
                  </td>
                  <td><strong>{{ report.reportName }}</strong></td>
                  <td>{{ report.reportType }}</td>
                  <td>{{ report.branchCode }}</td>
                  <td>{{ report.customerId }}</td>
                  <td><code>{{ report.accountNumber }}</code></td>
                  <td>{{ report.currency }}</td>
                  <td>{{ report.lastRunDate }}</td>
                  <td>
                    <span class="citi-badge" [ngClass]="getStatusBadgeClass(report.status)">
                      {{ report.status }}
                    </span>
                  </td>
                  <td>
                    <button class="citi-btn-primary action-btn-sm" (click)="onDemandGenerate(report, $event)">Generate</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="empty-msg">No statement report records match the selected query criteria.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Docked Bottom Action Bar -->
        <div class="docked-action-bar">
          <div class="bar-left">
            <span>Selected Report: <strong>{{ selectedReportName() || 'None' }}</strong></span>
          </div>
          <div class="bar-right">
            <button class="citi-btn-primary" [disabled]="!selectedReportId()" (click)="exportSelected('PDF')">
              Download PDF Ledger
            </button>
            <button class="citi-btn-secondary" [disabled]="!selectedReportId()" (click)="exportSelected('EXCEL')">
              Download Excel (.xlsx)
            </button>
            <button class="citi-btn-secondary" (click)="scheduleReport()">
              Schedule Recurring Job
            </button>
          </div>
        </div>
      </section>

      <!-- Lookup Modal -->
      @if (activeLookupType()) {
        <app-lookup-modal
          [type]="activeLookupType()!"
          [modalTitle]="getLookupTitle()"
          [branchCode]="filterBranch"
          [customerId]="filterCustomer"
          (itemSelected)="handleLookupSelection($event)"
          (dismissed)="activeLookupType.set(null)">
        </app-lookup-modal>
      }
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .landing-grid-page {
      padding: 0 0 40px 0;
    }

    .citi-banner-header {
      background-color: $citi-surface-banner;
      border-bottom: 1px solid $citi-border-subtle;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .banner-content {
        h2 {
          font-size: 15px;
          font-weight: 700;
          color: $citi-core-blue;
        }

        .banner-subtext {
          font-size: 11px;
          color: $citi-text-secondary;
          margin-top: 2px;
        }
      }
    }

    .citi-filter-card {
      margin: 16px 20px;
      background: #FFFFFF;
      border: 1px solid $citi-border-grid;
      border-radius: 2px;
      padding: 12px 16px;

      .filter-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr) auto;
        gap: 12px;
        align-items: flex-end;

        .input-with-button {
          display: flex;
          align-items: center;

          input {
            flex: 1;
            height: $citi-input-height;
            padding: 0 8px;
            font-size: 12px;
            border: 1px solid $citi-border-input;
            border-right: none;
            border-radius: 2px 0 0 2px;
          }

          .lookup-btn {
            width: 28px;
            height: $citi-input-height;
            background: linear-gradient(180deg, #FFFFFF 0%, #DCE6F0 100%);
            border: 1px solid $citi-border-input;
            border-radius: 0 2px 2px 0;
            color: $citi-core-blue;
            cursor: pointer;
          }
        }

        .filter-actions {
          display: flex;
          gap: 6px;
        }
      }
    }

    .table-section {
      margin: 0 20px;

      .table-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .record-counter {
          font-size: 11px;
          color: $citi-text-secondary;
        }

        .toolbar-right {
          display: flex;
          gap: 6px;

          .export-chip {
            background-color: #FFFFFF;
            border: 1px solid $citi-border-input;
            border-radius: 2px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 600;
            color: $citi-core-blue;
            cursor: pointer;

            &:hover:not(:disabled) {
              background-color: $citi-surface-table-head;
            }

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }

      .action-btn-sm {
        height: 22px;
        padding: 0 8px;
        font-size: 11px;
      }

      .empty-msg {
        text-align: center;
        padding: 24px;
        color: $citi-text-secondary;
      }
    }

    .docked-action-bar {
      margin-top: 16px;
      background: $citi-surface-table-head;
      border: 1px solid $citi-border-grid;
      border-radius: 2px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .bar-left {
        font-size: 12px;
        color: $citi-dark-midnight;
      }

      .bar-right {
        display: flex;
        gap: 8px;
      }
    }
  `]
})
export class LandingGridComponent implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);

  reports = signal<ReportItem[]>([]);
  selectedReportId = signal<string | null>(null);
  selectedReportName = signal<string | null>(null);

  filterBranch = '';
  filterCustomer = '';
  filterAccount = '';
  filterStatus = '';

  activeLookupType = signal<'BRANCHES' | 'CUSTOMERS' | 'ACCOUNTS' | null>(null);

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.reportService.getReports({
      branchCode: this.filterBranch,
      accountNumber: this.filterAccount,
      status: this.filterStatus
    }).subscribe(res => {
      this.reports.set(res);
      if (res.length > 0 && !this.selectedReportId()) {
        this.selectReport(res[0]);
      }
    });
  }

  applyFilters() {
    this.loadReports();
  }

  resetFilters() {
    this.filterBranch = '';
    this.filterCustomer = '';
    this.filterAccount = '';
    this.filterStatus = '';
    this.loadReports();
  }

  selectReport(report: ReportItem) {
    this.selectedReportId.set(report.id);
    this.selectedReportName.set(`${report.reportName} (${report.accountNumber})`);
  }

  toggleSelectAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked && this.reports().length > 0) {
      this.selectReport(this.reports()[0]);
    } else {
      this.selectedReportId.set(null);
      this.selectedReportName.set(null);
    }
  }

  onDemandGenerate(report: ReportItem, event: Event) {
    event.stopPropagation();
    this.reportService.generateReport(report.id).subscribe(res => {
      alert(`Report Generation Queued: ${res.reportId}\n${res.message}`);
      this.loadReports();
    });
  }

  exportSelected(format: 'PDF' | 'EXCEL' | 'CSV') {
    const id = this.selectedReportId();
    if (!id) return;

    this.reportService.exportReport(id, format).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citi-statement-${id}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  scheduleReport() {
    this.router.navigate(['/reports/schedule']);
  }

  navigateToCriteria() {
    this.router.navigate(['/reports/criteria']);
  }

  openLookup(type: 'BRANCHES' | 'CUSTOMERS' | 'ACCOUNTS') {
    this.activeLookupType.set(type);
  }

  getLookupTitle(): string {
    switch (this.activeLookupType()) {
      case 'BRANCHES': return 'Bank Branch Master Data Lookup';
      case 'CUSTOMERS': return 'Corporate Customer Entity Lookup';
      case 'ACCOUNTS': return 'Entitled Account Master Lookup';
      default: return 'Master Data Lookup';
    }
  }

  handleLookupSelection(item: LookupItem) {
    if (this.activeLookupType() === 'BRANCHES') {
      this.filterBranch = item.code || '';
    } else if (this.activeLookupType() === 'CUSTOMERS') {
      this.filterCustomer = item.customerId || '';
    } else if (this.activeLookupType() === 'ACCOUNTS') {
      this.filterAccount = item.accountNumber || '';
    }
    this.activeLookupType.set(null);
    this.loadReports();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'SCHEDULED': return 'badge-active';
      case 'PENDING': return 'badge-pending';
      case 'FAILED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }
}
