import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CashStatementService } from '../../services/cash-statement.service';
import { Account, ReportTemplate } from '../../models/cash-statement.model';
import { SubNavBreadcrumbComponent } from '../../components/sub-nav-breadcrumb/sub-nav-breadcrumb.component';
import { BinocularLookupComponent } from '../../components/binocular-lookup/binocular-lookup.component';
import { FormulaOperatorComponent } from '../../components/formula-operator/formula-operator.component';
import { LookupModalComponent } from '../lookup-modal/lookup-modal.component';
import { DockedActionBarComponent } from '../../components/docked-action-bar/docked-action-bar.component';

@Component({
  selector: 'app-criteria-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SubNavBreadcrumbComponent,
    BinocularLookupComponent,
    FormulaOperatorComponent,
    LookupModalComponent,
    DockedActionBarComponent
  ],
  template: `
    <div class="criteria-page-container">
      <app-sub-nav-breadcrumb currentTitle="Account Statement Criteria Search"></app-sub-nav-breadcrumb>

      <div class="criteria-header-banner">
        <div class="banner-title-group">
          <h2>Cash Statement Report Criteria</h2>
          <p>Specify filtering parameters for transaction ledger generation, export, or scheduling.</p>
        </div>
        <div class="banner-actions">
          <button type="button" class="btn-citi-secondary" (click)="isLookupModalOpen.set(true)">
            📋 Load Base Report Template
          </button>
        </div>
      </div>

      <div class="criteria-content">
        <form [formGroup]="criteriaForm" class="criteria-form-grid" (ngSubmit)="onGenerate()">
          <!-- Column 1: Account & Entity Selection -->
          <div class="form-column">
            <div class="column-card">
              <h3 class="card-heading">1. Account & Entity Scope</h3>

              <div class="form-field">
                <label>Target Account Number</label>
                <div class="input-with-fx">
                  <app-formula-operator
                    [selectedOperator]="accountOp()"
                    (operatorChange)="accountOp.set($event)"></app-formula-operator>
                  <select formControlName="accountNumber" class="citi-select full-width">
                    <option value="">-- All Entitled Accounts --</option>
                    @for (acc of accounts(); track acc.id) {
                      <option [value]="acc.account_number">
                        {{ acc.account_number }} ({{ acc.currency }}) - {{ acc.account_name }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-field">
                <label>Corporate Entity ID</label>
                <input
                  type="text"
                  formControlName="entityId"
                  class="citi-input full-width"
                  placeholder="e.g. CITI-US-TREASURY" />
              </div>

              <div class="form-field">
                <label>Currency Filter</label>
                <select formControlName="currency" class="citi-select full-width">
                  <option value="">-- All Currencies --</option>
                  <option value="USD">USD - United States Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>

              <div class="form-field">
                <label>Base Template Reference</label>
                <app-binocular-lookup
                  label="Report Template"
                  placeholder="Select template..."
                  [value]="selectedTemplateName()"
                  [readonly]="true"
                  (openModal)="isLookupModalOpen.set(true)"></app-binocular-lookup>
              </div>
            </div>
          </div>

          <!-- Column 2: Date & Interval Matrix -->
          <div class="form-column">
            <div class="column-card">
              <h3 class="card-heading">2. Date Range & Valuation</h3>

              <div class="form-field">
                <label>Date Preset Filter</label>
                <div class="radio-pill-group">
                  <label class="radio-pill">
                    <input type="radio" formControlName="datePreset" value="TODAY" (change)="applyDatePreset('TODAY')" />
                    <span>Today (Intraday)</span>
                  </label>
                  <label class="radio-pill">
                    <input type="radio" formControlName="datePreset" value="YESTERDAY" (change)="applyDatePreset('YESTERDAY')" />
                    <span>Previous Business Day</span>
                  </label>
                  <label class="radio-pill">
                    <input type="radio" formControlName="datePreset" value="MTD" (change)="applyDatePreset('MTD')" />
                    <span>Month to Date</span>
                  </label>
                  <label class="radio-pill">
                    <input type="radio" formControlName="datePreset" value="CUSTOM" (change)="applyDatePreset('CUSTOM')" />
                    <span>Custom Date Range</span>
                  </label>
                </div>
              </div>

              <div class="date-range-row">
                <div class="form-field half-width">
                  <label>From Date</label>
                  <input type="date" formControlName="dateFrom" class="citi-input full-width" />
                </div>
                <div class="form-field half-width">
                  <label>To Date</label>
                  <input type="date" formControlName="dateTo" class="citi-input full-width" />
                </div>
              </div>

              <div class="form-field">
                <label>Statement Classification Type</label>
                <select formControlName="statementType" class="citi-select full-width">
                  <option value="DETAILED">Detailed Transaction Ledger</option>
                  <option value="SUMMARY">End of Day Balance Summary</option>
                  <option value="INTERIM">Interim Valuation Statement</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Column 3: Output & Dual-Control Actions -->
          <div class="form-column">
            <div class="column-card">
              <h3 class="card-heading">3. Format & Delivery Options</h3>

              <div class="form-field">
                <label>Preferred Export Format</label>
                <div class="export-format-options">
                  <label class="format-card" [class.selected]="criteriaForm.get('exportFormat')?.value === 'PDF'">
                    <input type="radio" formControlName="exportFormat" value="PDF" />
                    <span class="format-icon">📄</span>
                    <span class="format-text">PDF Statement</span>
                  </label>
                  <label class="format-card" [class.selected]="criteriaForm.get('exportFormat')?.value === 'EXCEL'">
                    <input type="radio" formControlName="exportFormat" value="EXCEL" />
                    <span class="format-icon">📊</span>
                    <span class="format-text">Excel (.xlsx)</span>
                  </label>
                  <label class="format-card" [class.selected]="criteriaForm.get('exportFormat')?.value === 'CSV'">
                    <input type="radio" formControlName="exportFormat" value="CSV" />
                    <span class="format-icon">📑</span>
                    <span class="format-text">CSV Raw Feed</span>
                  </label>
                </div>
              </div>

              <div class="governance-alert">
                <div class="alert-icon">⚠️</div>
                <div class="alert-text">
                  <strong>Segregation of Duties Notice:</strong>
                  Schedules and automated recurring deliveries require Checker review before activation.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <app-docked-action-bar selectionText="Criteria configured for corporate treasury statement generation">
        <button type="button" class="btn-citi-secondary" (click)="resetForm()">Reset Criteria</button>
        <button type="button" class="btn-citi-secondary" (click)="onSaveSchedule()">Create Recurring Schedule</button>
        <button type="button" class="btn-citi-primary" (click)="onGenerate()" [disabled]="isLoading()">
          {{ isLoading() ? 'Generating Statement...' : 'Generate Statement' }}
        </button>
      </app-docked-action-bar>

      <app-lookup-modal
        [isOpen]="isLookupModalOpen()"
        [templates]="templates()"
        (close)="isLookupModalOpen.set(false)"
        (templateSelected)="onTemplateSelected($event)">
      </app-lookup-modal>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .criteria-page-container {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .criteria-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: $citi-surface-banner;
      padding: 16px 24px;
      border-bottom: 1px solid $citi-border-grid;

      h2 {
        color: $citi-blue;
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      p {
        color: $citi-text-secondary;
        font-size: 12px;
      }
    }

    .criteria-content {
      flex: 1;
      padding: 20px 24px;
    }

    .criteria-form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .column-card {
      background: #FFFFFF;
      border: 1px solid $citi-border-subtle;
      border-radius: $radius-card;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      height: 100%;
    }

    .card-heading {
      font-size: 13px;
      font-weight: 700;
      color: $citi-blue;
      border-bottom: 2px solid $citi-surface-table-head;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .form-field {
      margin-bottom: 14px;

      label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: $citi-text-secondary;
        margin-bottom: 4px;
      }
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: 48%;
    }

    .input-with-fx {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .radio-pill-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .radio-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border: 1px solid $citi-border-input;
      border-radius: $radius-default;
      font-size: 11px;
      cursor: pointer;
      background: $citi-surface-canvas;

      &:has(input:checked) {
        background-color: $citi-surface-banner;
        border-color: $citi-blue;
        font-weight: 600;
        color: $citi-blue;
      }
    }

    .date-range-row {
      display: flex;
      justify-content: space-between;
    }

    .export-format-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .format-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: 1px solid $citi-border-input;
      border-radius: $radius-default;
      cursor: pointer;
      background: #FFFFFF;

      &.selected {
        border-color: $citi-cyan-accent;
        background-color: $citi-surface-banner;
        font-weight: 600;
      }

      .format-icon {
        font-size: 16px;
      }

      .format-text {
        font-size: 12px;
      }
    }

    .governance-alert {
      display: flex;
      gap: 8px;
      padding: 10px;
      background-color: $citi-warning-bg;
      border: 1px solid #ECC94B;
      border-radius: $radius-default;
      margin-top: 16px;
      font-size: 11px;
      color: #744210;
    }
  `]
})
export class CriteriaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cashService = inject(CashStatementService);
  private router = inject(Router);

  criteriaForm: FormGroup = this.fb.group({
    accountNumber: [''],
    entityId: ['CITI-US-TREASURY'],
    currency: ['USD'],
    templateId: ['TMPL_CASH_EOD'],
    datePreset: ['TODAY'],
    dateFrom: [new Date().toISOString().substring(0, 10)],
    dateTo: [new Date().toISOString().substring(0, 10)],
    statementType: ['DETAILED'],
    exportFormat: ['PDF']
  });

  accounts = signal<Account[]>([]);
  templates = signal<ReportTemplate[]>([]);
  isLookupModalOpen = signal<boolean>(false);
  selectedTemplateName = signal<string>('End of Day Cash Ledger Balance');
  accountOp = signal<string>('equals');
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.cashService.getAccounts().subscribe({
      next: (accs) => this.accounts.set(accs),
      error: () => console.warn('Could not load accounts')
    });

    this.cashService.getReportTemplates().subscribe({
      next: (tmpls) => this.templates.set(tmpls),
      error: () => console.warn('Could not load templates')
    });
  }

  applyDatePreset(preset: string) {
    const today = new Date();
    if (preset === 'TODAY') {
      const d = today.toISOString().substring(0, 10);
      this.criteriaForm.patchValue({ dateFrom: d, dateTo: d });
    } else if (preset === 'YESTERDAY') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const d = y.toISOString().substring(0, 10);
      this.criteriaForm.patchValue({ dateFrom: d, dateTo: d });
    } else if (preset === 'MTD') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substring(0, 10);
      const d = today.toISOString().substring(0, 10);
      this.criteriaForm.patchValue({ dateFrom: firstDay, dateTo: d });
    }
  }

  onTemplateSelected(template: ReportTemplate) {
    this.criteriaForm.patchValue({ templateId: template.template_id });
    this.selectedTemplateName.set(template.report_name);
  }

  resetForm() {
    this.criteriaForm.reset({
      accountNumber: '',
      entityId: 'CITI-US-TREASURY',
      currency: 'USD',
      templateId: 'TMPL_CASH_EOD',
      datePreset: 'TODAY',
      dateFrom: new Date().toISOString().substring(0, 10),
      dateTo: new Date().toISOString().substring(0, 10),
      statementType: 'DETAILED',
      exportFormat: 'PDF'
    });
  }

  onGenerate() {
    this.isLoading.set(true);
    const formVal = this.criteriaForm.value;
    const req = {
      account_numbers: formVal.accountNumber ? [formVal.accountNumber] : undefined,
      currency: formVal.currency || undefined,
      entity_id: formVal.entityId || undefined,
      date_from: formVal.dateFrom ? `${formVal.dateFrom}T00:00:00Z` : undefined,
      date_to: formVal.dateTo ? `${formVal.dateTo}T23:59:59Z` : undefined,
      statement_type: formVal.statementType,
      page: 0,
      size: 50
    };

    this.cashService.generateStatement(req).subscribe({
      next: (resp) => {
        this.isLoading.set(false);
        // Navigate to landing grid with state
        sessionStorage.setItem('citi_last_statement_result', JSON.stringify(resp));
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        alert('Statement generated with empty result set or error: ' + (err.error?.message || err.statusText));
        this.router.navigate(['/']);
      }
    });
  }

  onSaveSchedule() {
    const formVal = this.criteriaForm.value;
    this.router.navigate(['/schedules'], {
      queryParams: {
        templateId: formVal.templateId,
        account: formVal.accountNumber,
        currency: formVal.currency,
        format: formVal.exportFormat
      }
    });
  }
}
