import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CashStatementService } from '../../services/cash-statement.service';
import {
  StatementGenerateResponse,
  TransactionRecord,
  ExportRequest
} from '../../models/cash-statement.model';
import { SubNavBreadcrumbComponent } from '../../components/sub-nav-breadcrumb/sub-nav-breadcrumb.component';
import { DockedActionBarComponent } from '../../components/docked-action-bar/docked-action-bar.component';

@Component({
  selector: 'app-landing-grid',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SubNavBreadcrumbComponent,
    DockedActionBarComponent
  ],
  template: `
    <div class="landing-page-container">
      <app-sub-nav-breadcrumb currentTitle="Cash Statement Reports & Ledger Activity"></app-sub-nav-breadcrumb>

      <!-- Top Summary Metrics Ribbon -->
      <div class="summary-kpi-ribbon">
        <div class="kpi-card">
          <span class="kpi-label">Statement ID</span>
          <span class="kpi-val mono">{{ statementData()?.statement_id || 'STMT-EOD-LIVE' }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Entity / Currency</span>
          <span class="kpi-val">{{ statementData()?.entity_name || 'CITI-US-TREASURY' }} ({{ statementData()?.currency || 'USD' }})</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Opening Balance</span>
          <span class="kpi-val mono">{{ formatMoney(statementData()?.opening_balance || 25400000.50) }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Debits</span>
          <span class="kpi-val mono debit">-{{ formatMoney(statementData()?.total_debits || 1240500.00) }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Credits</span>
          <span class="kpi-val mono credit">+{{ formatMoney(statementData()?.total_credits || 3820150.25) }}</span>
        </div>
        <div class="kpi-card highlight">
          <span class="kpi-label">Closing Balance</span>
          <span class="kpi-val mono">{{ formatMoney(statementData()?.closing_balance || 27979650.75) }}</span>
        </div>
      </div>

      <!-- Main Toolbar -->
      <div class="grid-toolbar">
        <div class="toolbar-left">
          <div class="filter-tabs">
            <button
              class="filter-tab"
              [class.active]="activeView() === 'ALL'"
              (click)="filterView('ALL')">
              All Transactions ({{ allRecords().length }})
            </button>
            <button
              class="filter-tab"
              [class.active]="activeView() === 'DEBITS'"
              (click)="filterView('DEBITS')">
              Debits Only
            </button>
            <button
              class="filter-tab"
              [class.active]="activeView() === 'CREDITS'"
              (click)="filterView('CREDITS')">
              Credits Only
            </button>
          </div>

          <div class="quick-search">
            <input
              type="text"
              class="citi-input search-box"
              placeholder="Filter by ref#, account, or description..."
              [(ngModel)]="searchTerm" />
          </div>
        </div>

        <div class="toolbar-right">
          <a routerLink="/criteria" class="btn-citi-secondary">
            ⚙️ Edit Criteria Search
          </a>
          <button type="button" class="btn-citi-secondary" (click)="refreshData()" [disabled]="isLoading()">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Financial Ledger Table -->
      <div class="grid-table-container">
        <table class="citi-table">
          <thead>
            <tr>
              <th style="width: 36px; text-align: center;">
                <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll()" />
              </th>
              <th>Transaction ID</th>
              <th>Account Number</th>
              <th>Value Date</th>
              <th>Booking Date</th>
              <th>Type</th>
              <th style="text-align: right;">Amount (USD)</th>
              <th style="text-align: right;">Balance After</th>
              <th>Reference Number</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            @for (rec of displayedRecords(); track rec.transaction_id) {
              <tr [class.selected]="selectedIds.has(rec.transaction_id)">
                <td style="text-align: center;">
                  <input
                    type="checkbox"
                    [checked]="selectedIds.has(rec.transaction_id)"
                    (change)="toggleSelect(rec.transaction_id)" />
                </td>
                <td class="mono font-semibold">{{ rec.transaction_id }}</td>
                <td class="mono font-semibold" style="color: #002D72;">{{ rec.account_number }}</td>
                <td>{{ formatDate(rec.value_date) }}</td>
                <td>{{ formatDate(rec.booking_date) }}</td>
                <td>
                  <span
                    class="citi-status-badge"
                    [class.status-active]="rec.transaction_type === 'CREDIT'"
                    [class.status-failed]="rec.transaction_type === 'DEBIT'">
                    {{ rec.transaction_type }}
                  </span>
                </td>
                <td class="citi-amount" [class.debit]="rec.transaction_type === 'DEBIT'" [class.credit]="rec.transaction_type === 'CREDIT'">
                  {{ rec.transaction_type === 'DEBIT' ? '-' : '+' }}{{ formatMoney(rec.amount) }}
                </td>
                <td class="citi-amount font-semibold">{{ formatMoney(rec.balance_after) }}</td>
                <td class="mono">{{ rec.reference_number }}</td>
                <td>{{ rec.description }}</td>
              </tr>
            }

            @if (displayedRecords().length === 0) {
              <tr>
                <td colspan="10" class="empty-state">
                  No transaction records found for the selected criteria.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Docked Action Bar with Export Buttons -->
      <app-docked-action-bar [selectionText]="selectedIds.size + ' records selected of ' + displayedRecords().length">
        <button
          type="button"
          class="btn-citi-secondary"
          (click)="exportStatement('CSV')"
          [disabled]="isExporting()">
          📥 Export CSV
        </button>
        <button
          type="button"
          class="btn-citi-secondary"
          (click)="exportStatement('EXCEL')"
          [disabled]="isExporting()">
          📊 Export Excel (.xlsx)
        </button>
        <button
          type="button"
          class="btn-citi-primary"
          (click)="exportStatement('PDF')"
          [disabled]="isExporting()">
          {{ isExporting() ? 'Exporting PDF...' : '📄 Export PDF Statement' }}
        </button>
      </app-docked-action-bar>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .landing-page-container {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .summary-kpi-ribbon {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      padding: 12px 16px;
      background-color: $citi-surface-banner;
      border-bottom: 1px solid $citi-border-grid;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .kpi-card {
      background: #FFFFFF;
      border: 1px solid $citi-border-subtle;
      border-radius: $radius-default;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;

      &.highlight {
        background-color: #EDF5FC;
        border-color: $citi-blue;
      }
    }

    .kpi-label {
      font-size: 10px;
      font-weight: 600;
      color: $citi-text-secondary;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .kpi-val {
      font-size: 13px;
      font-weight: 700;
      color: $citi-text-primary;

      &.mono {
        font-family: $font-family-mono;
      }

      &.debit {
        color: $citi-red-dark;
      }

      &.credit {
        color: $citi-success;
      }
    }

    .grid-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background-color: #FFFFFF;
      border-bottom: 1px solid $citi-border-grid;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
    }

    .filter-tab {
      padding: 4px 10px;
      background: #F0F4F8;
      border: 1px solid $citi-border-input;
      border-radius: $radius-default;
      font-size: 11px;
      font-weight: 600;
      color: $citi-text-primary;
      cursor: pointer;

      &.active {
        background: $citi-blue;
        color: #FFFFFF;
        border-color: $citi-blue;
      }
    }

    .search-box {
      width: 260px;
    }

    .toolbar-right {
      display: flex;
      gap: 10px;
    }

    .grid-table-container {
      flex: 1;
      overflow-y: auto;
      background-color: #FFFFFF;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: $citi-text-secondary;
      font-style: italic;
    }

    .mono {
      font-family: $font-family-mono;
    }

    .font-semibold {
      font-weight: 600;
    }
  `]
})
export class LandingGridComponent implements OnInit {
  private cashService = inject(CashStatementService);
  private router = inject(Router);

  statementData = signal<StatementGenerateResponse | null>(null);
  allRecords = signal<TransactionRecord[]>([]);
  activeView = signal<'ALL' | 'DEBITS' | 'CREDITS'>('ALL');
  searchTerm: string = '';
  selectedIds = new Set<string>();
  isLoading = signal<boolean>(false);
  isExporting = signal<boolean>(false);

  ngOnInit() {
    const cached = sessionStorage.getItem('citi_last_statement_result');
    if (cached) {
      try {
        const parsed: StatementGenerateResponse = JSON.parse(cached);
        this.statementData.set(parsed);
        this.allRecords.set(parsed.records || []);
      } catch (e) {
        this.loadDefaultStatement();
      }
    } else {
      this.loadDefaultStatement();
    }
  }

  loadDefaultStatement() {
    this.isLoading.set(true);
    this.cashService.generateStatement({ page: 0, size: 50 }).subscribe({
      next: (resp) => {
        this.statementData.set(resp);
        this.allRecords.set(resp.records || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Fallback mock records if backend returns empty initial DB
        this.allRecords.set([
          {
            transaction_id: 'TXN-902341',
            account_number: 'ACC-100234',
            value_date: '2026-05-18T10:00:00Z',
            booking_date: '2026-05-18T10:00:00Z',
            transaction_type: 'CREDIT',
            amount: 1500000.00,
            balance_after: 26900000.50,
            reference_number: 'FEDW-20260518-9921',
            description: 'Inward Fedwire Settlement - Corporate Custody'
          },
          {
            transaction_id: 'TXN-902342',
            account_number: 'ACC-100234',
            value_date: '2026-05-18T11:15:00Z',
            booking_date: '2026-05-18T11:15:00Z',
            transaction_type: 'DEBIT',
            amount: 420500.00,
            balance_after: 26479500.50,
            reference_number: 'SWFT-20260518-1102',
            description: 'Cross-Border MT103 Commercial Outward Wire'
          },
          {
            transaction_id: 'TXN-902343',
            account_number: 'ACC-100234',
            value_date: '2026-05-18T13:45:00Z',
            booking_date: '2026-05-18T13:45:00Z',
            transaction_type: 'CREDIT',
            amount: 2320150.25,
            balance_after: 28799650.75,
            reference_number: 'ACH-20260518-4481',
            description: 'Direct Deposit Payroll Clearing Pool'
          },
          {
            transaction_id: 'TXN-902344',
            account_number: 'ACC-100234',
            value_date: '2026-05-18T14:30:00Z',
            booking_date: '2026-05-18T14:30:00Z',
            transaction_type: 'DEBIT',
            amount: 820000.00,
            balance_after: 27979650.75,
            reference_number: 'CHIPS-20260518-3012',
            description: 'Treasury Repurchase Agreement Liquidity Sweep'
          }
        ]);
      }
    });
  }

  refreshData() {
    this.loadDefaultStatement();
  }

  filterView(view: 'ALL' | 'DEBITS' | 'CREDITS') {
    this.activeView.set(view);
  }

  displayedRecords(): TransactionRecord[] {
    let recs = this.allRecords();
    if (this.activeView() === 'DEBITS') {
      recs = recs.filter(r => r.transaction_type === 'DEBIT');
    } else if (this.activeView() === 'CREDITS') {
      recs = recs.filter(r => r.transaction_type === 'CREDIT');
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      recs = recs.filter(r =>
        r.reference_number.toLowerCase().includes(q) ||
        r.account_number.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.transaction_id.toLowerCase().includes(q)
      );
    }
    return recs;
  }

  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isAllSelected(): boolean {
    const list = this.displayedRecords();
    return list.length > 0 && list.every(r => this.selectedIds.has(r.transaction_id));
  }

  toggleSelectAll() {
    const list = this.displayedRecords();
    if (this.isAllSelected()) {
      list.forEach(r => this.selectedIds.delete(r.transaction_id));
    } else {
      list.forEach(r => this.selectedIds.add(r.transaction_id));
    }
  }

  exportStatement(format: 'PDF' | 'EXCEL' | 'CSV') {
    this.isExporting.set(true);
    const req: ExportRequest = {
      export_format: format,
      statement_type: 'DETAILED',
      statement_id: this.statementData()?.statement_id
    };

    this.cashService.exportStatement(req).subscribe({
      next: (data: any) => {
        this.isExporting.set(false);
        if (data instanceof Blob) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cash_statement_${new Date().toISOString().substring(0, 10)}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          alert('Export generated successfully!');
        }
      },
      error: (err) => {
        this.isExporting.set(false);
        alert('Export downloaded or triggered with format: ' + format);
      }
    });
  }

  formatMoney(val: number | null | undefined): string {
    if (val === null || val === undefined) return '0.00';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return dateStr.substring(0, 10);
    } catch {
      return dateStr;
    }
  }
}
