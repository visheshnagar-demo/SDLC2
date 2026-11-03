import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { LookupItem } from '../../../../core/models/report.models';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BinocularLookupComponent } from '../../../../shared/components/binocular-lookup/binocular-lookup.component';
import { DateMatrixComponent } from '../../../../shared/components/date-matrix/date-matrix.component';
import { LookupModalComponent } from '../lookup-modal/lookup-modal.component';

@Component({
  selector: 'app-criteria-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    BreadcrumbComponent, 
    BinocularLookupComponent, 
    DateMatrixComponent, 
    LookupModalComponent
  ],
  template: `
    <div class="criteria-form-page">
      <app-breadcrumb currentSection="Account Statement Criteria"></app-breadcrumb>

      <!-- Banner Header -->
      <section class="citi-banner-header">
        <div class="banner-title">
          <h2>Account Statement — Comprehensive Report Criteria</h2>
          <span class="instruction">Fields marked with an asterisk (<span class="req">*</span>) are mandatory.</span>
        </div>
        <div class="banner-actions">
          <button class="citi-btn-primary" (click)="onSubmitRunNow()">Run Statement Now</button>
          <button class="citi-btn-secondary" (click)="onSaveAndSchedule()">Schedule Report</button>
        </div>
      </section>

      <!-- Main Criteria Form Card -->
      <div class="citi-form-card">
        <form [formGroup]="criteriaForm">
          <div class="form-grid-3col">
            
            <!-- Column 1: Identification & Base Report -->
            <div class="form-column">
              <h3 class="col-header">1. Report Template &amp; Origin</h3>

              <div class="citi-form-group">
                <label>Base Report Name <span class="required">*</span></label>
                <app-binocular-lookup
                  [control]="getControl('baseReportName')"
                  placeholder="Select base report template..."
                  [readonly]="true"
                  [showFx]="true"
                  (lookupClicked)="openLookup('REPORT_NAMES')">
                </app-binocular-lookup>
              </div>

              <div class="citi-form-group">
                <label>Bank Number / Branch Code <span class="required">*</span></label>
                <app-binocular-lookup
                  [control]="getControl('branchCode')"
                  placeholder="Select branch code..."
                  [showFx]="true"
                  (lookupClicked)="openLookup('BRANCHES')">
                </app-binocular-lookup>
              </div>

              <div class="citi-form-group">
                <label>Customer Identifier / Entity <span class="required">*</span></label>
                <app-binocular-lookup
                  [control]="getControl('customerNumber')"
                  placeholder="Select customer ID..."
                  [showFx]="true"
                  (lookupClicked)="openLookup('CUSTOMERS')">
                </app-binocular-lookup>
              </div>

              <div class="citi-form-group">
                <label>Designated Statement Owner</label>
                <input type="text" formControlName="designatedOwner" placeholder="corp-treasury@acme.com" />
              </div>
            </div>

            <!-- Column 2: Account Specifications & Currency -->
            <div class="form-column">
              <h3 class="col-header">2. Account Entitlement &amp; Currency</h3>

              <div class="citi-form-group">
                <label>Account Number <span class="required">*</span></label>
                <app-binocular-lookup
                  [control]="getControl('accountNumber')"
                  placeholder="Select account number..."
                  [showFx]="true"
                  (lookupClicked)="openLookup('ACCOUNTS')">
                </app-binocular-lookup>
              </div>

              <div class="citi-form-group">
                <label>Account Currency <span class="required">*</span></label>
                <select formControlName="currency">
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="SGD">SGD — Singapore Dollar</option>
                  <option value="JPY">JPY — Japanese Yen</option>
                  <option value="HKD">HKD — Hong Kong Dollar</option>
                </select>
              </div>

              <div class="citi-form-group">
                <label>Customer Reference Tag</label>
                <input type="text" formControlName="customerReference" placeholder="e.g. CORP-APAC-LEDGER-01" />
              </div>

              <div class="citi-form-group">
                <label>Bank Clearing Reference</label>
                <input type="text" formControlName="bankReference" placeholder="e.g. SWIFT-MT940-CITI" />
              </div>

              <div class="citi-form-group">
                <label>Service Class Entitlement</label>
                <select formControlName="serviceClassId">
                  <option value="SC_CORPORATE_PREMIUM">Corporate Premium Cash Tier</option>
                  <option value="SC_INSTITUTIONAL_LIQ">Institutional Liquidity Manager</option>
                  <option value="SC_STANDARD_COMMERCIAL">Standard Commercial Banking</option>
                </select>
              </div>
            </div>

            <!-- Column 3: Statement & Value Date Matrices -->
            <div class="form-column">
              <h3 class="col-header">3. Date Selection &amp; Accounting Range</h3>

              <div class="citi-form-group">
                <label>Statement Posting Date <span class="required">*</span></label>
                <app-date-matrix
                  [selectedOption]="criteriaForm.get('statementDateOption')?.value"
                  (optionChanged)="onStatementDateOptionChange($event)">
                </app-date-matrix>
              </div>

              <div class="citi-form-group" style="margin-top: 14px;">
                <label>Export Layout Format</label>
                <div class="radio-group-horizontal">
                  <label><input type="radio" formControlName="exportFormat" value="PDF" /> PDF (9-Col Ledger)</label>
                  <label><input type="radio" formControlName="exportFormat" value="EXCEL" /> Excel (.xlsx)</label>
                  <label><input type="radio" formControlName="exportFormat" value="CSV" /> CSV Standard</label>
                </div>
              </div>
            </div>

          </div>

          <!-- Docked Form Footer -->
          <div class="form-actions-dock">
            <div class="status-summary">
              @if (formSubmitted && criteriaForm.invalid) {
                <span class="err-text">&#9888; Please complete all mandatory criteria fields marked in red.</span>
              } @else {
                <span class="info-text">Dual-control parameters will be validated upon submission.</span>
              }
            </div>
            <div class="btn-group">
              <button type="button" class="citi-btn-secondary" (click)="resetForm()">Reset To Defaults</button>
              <button type="button" class="citi-btn-secondary" (click)="onSaveAndSchedule()">Save &amp; Build Schedule</button>
              <button type="button" class="citi-btn-primary" (click)="onSubmitRunNow()">Generate Statement</button>
            </div>
          </div>
        </form>
      </div>

      <!-- Master Data Lookup Modal Overlay -->
      @if (activeLookupType()) {
        <app-lookup-modal
          [type]="activeLookupType()!"
          [modalTitle]="getLookupTitle()"
          [branchCode]="criteriaForm.get('branchCode')?.value"
          [customerId]="criteriaForm.get('customerNumber')?.value"
          (itemSelected)="handleLookupSelection($event)"
          (dismissed)="activeLookupType.set(null)">
        </app-lookup-modal>
      }
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .criteria-form-page {
      padding-bottom: 40px;
    }

    .citi-banner-header {
      background-color: $citi-surface-banner;
      border-bottom: 1px solid $citi-border-subtle;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .banner-title {
        h2 {
          font-size: 15px;
          font-weight: 700;
          color: $citi-core-blue;
        }

        .instruction {
          font-size: 11px;
          color: $citi-text-secondary;

          .req {
            color: $citi-required-asterisk;
            font-weight: 700;
          }
        }
      }

      .banner-actions {
        display: flex;
        gap: 8px;
      }
    }

    .citi-form-card {
      margin: 16px 20px;
      background: #FFFFFF;
      border: 1px solid $citi-border-grid;
      border-radius: 2px;
      padding: 20px;

      .form-grid-3col {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;

        .form-column {
          .col-header {
            font-size: 13px;
            font-weight: 700;
            color: $citi-core-blue;
            padding-bottom: 6px;
            margin-bottom: 14px;
            border-bottom: 2px solid $citi-surface-table-head;
          }
        }
      }

      .radio-group-horizontal {
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: $citi-text-primary;
        margin-top: 6px;

        label {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
      }

      .form-actions-dock {
        margin-top: 24px;
        padding-top: 14px;
        border-top: 1px solid $citi-border-subtle;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .status-summary {
          font-size: 11px;

          .err-text {
            color: $citi-required-asterisk;
            font-weight: 600;
          }

          .info-text {
            color: $citi-text-secondary;
          }
        }

        .btn-group {
          display: flex;
          gap: 8px;
        }
      }
    }
  `]
})
export class CriteriaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private router = inject(Router);

  criteriaForm!: FormGroup;
  formSubmitted = false;
  activeLookupType = signal<'REPORT_NAMES' | 'BRANCHES' | 'CUSTOMERS' | 'ACCOUNTS' | null>(null);

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.criteriaForm = this.fb.group({
      reportTemplateId: ['REP-1001', Validators.required],
      baseReportName: ['Account Statement - Comprehensive', Validators.required],
      branchCode: ['NYC-001', Validators.required],
      customerNumber: ['CUST-884920', Validators.required],
      accountNumber: ['110293848201', Validators.required],
      currency: ['USD', Validators.required],
      statementDateOption: ['YESTERDAY', Validators.required],
      valueDateOption: ['YESTERDAY'],
      designatedOwner: ['treasury-operations@acme.com'],
      customerReference: ['CORP-APAC-2026-Q1'],
      bankReference: ['CITI-SWIFT-940'],
      serviceClassId: ['SC_CORPORATE_PREMIUM'],
      exportFormat: ['PDF']
    });
  }

  getControl(name: string): FormControl {
    return this.criteriaForm.get(name) as FormControl;
  }

  onStatementDateOptionChange(option: string) {
    this.criteriaForm.patchValue({ statementDateOption: option });
  }

  openLookup(type: 'REPORT_NAMES' | 'BRANCHES' | 'CUSTOMERS' | 'ACCOUNTS') {
    this.activeLookupType.set(type);
  }

  getLookupTitle(): string {
    switch (this.activeLookupType()) {
      case 'REPORT_NAMES': return 'Base Report Template Selection';
      case 'BRANCHES': return 'Bank Branch Master Data Lookup';
      case 'CUSTOMERS': return 'Corporate Customer Entity Lookup';
      case 'ACCOUNTS': return 'Entitled Account Master Lookup';
      default: return 'Master Data Lookup';
    }
  }

  handleLookupSelection(item: LookupItem) {
    if (this.activeLookupType() === 'REPORT_NAMES') {
      this.criteriaForm.patchValue({
        reportTemplateId: item.code || item.id,
        baseReportName: item.name
      });
    } else if (this.activeLookupType() === 'BRANCHES') {
      this.criteriaForm.patchValue({ branchCode: item.code });
    } else if (this.activeLookupType() === 'CUSTOMERS') {
      this.criteriaForm.patchValue({ customerNumber: item.customerId });
    } else if (this.activeLookupType() === 'ACCOUNTS') {
      this.criteriaForm.patchValue({
        accountNumber: item.accountNumber,
        currency: item.currency || 'USD'
      });
    }
    this.activeLookupType.set(null);
  }

  onSubmitRunNow() {
    this.formSubmitted = true;
    if (this.criteriaForm.invalid) return;

    this.reportService.generateReport(this.criteriaForm.value.reportTemplateId, this.criteriaForm.value).subscribe(res => {
      alert(`Statement Generation Successfully Initiated!\nReport ID: ${res.reportId}\nFormat: ${this.criteriaForm.value.exportFormat}`);
      this.router.navigate(['/reports']);
    });
  }

  onSaveAndSchedule() {
    this.formSubmitted = true;
    if (this.criteriaForm.invalid) return;

    this.router.navigate(['/reports/schedule'], {
      state: { criteria: this.criteriaForm.value }
    });
  }

  resetForm() {
    this.initForm();
    this.formSubmitted = false;
  }
}
