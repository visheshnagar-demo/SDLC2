import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LookupService } from '../../../../core/services/lookup.service';
import { ReportService } from '../../../../core/services/report.service';
import { BaseReport, LookupAccount, ReportCriteria } from '../../../../core/models/report.models';
import { ReportLookupModalComponent } from '../../components/report-lookup-modal/report-lookup-modal.component';

@Component({
  selector: 'app-criteria-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ReportLookupModalComponent],
  templateUrl: './criteria-form.component.html',
  styleUrl: './criteria-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriteriaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lookupService = inject(LookupService);
  private reportService = inject(ReportService);
  private router = inject(Router);

  criteriaForm!: FormGroup;
  isLookupOpen = signal<boolean>(false);
  isAccountLookupOpen = signal<boolean>(false);
  isFxMenuOpen = signal<boolean>(false);

  selectedAccounts = signal<string[]>(['CITI-US-99201488', 'CITI-GB-88402199']);
  availableAccounts = signal<LookupAccount[]>([]);
  activeDatePreset = signal<string>('Last 30 Days');
  selectedOperator = signal<string>('Between Range');
  isSubmitting = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.criteriaForm = this.fb.group({
      baseReportCode: ['CASH_STMT_EOD', Validators.required],
      baseReportName: ['End of Day Consolidated Cash Statement', Validators.required],
      scopeType: ['specific', Validators.required],
      branchCode: ['NYC-001 - New York Main Branch', Validators.required],
      currency: ['USD', Validators.required],
      legalEntity: [{ value: 'CITI-US-NA (Citibank N.A. New York)', disabled: true }],
      dateMode: ['preset'],
      datePreset: ['Last 30 Days'],
      dateFrom: ['2026-05-01 00:00 EST'],
      dateTo: ['2026-05-18 23:59 EST'],
      transactionType: ['ALL', Validators.required],
      minAmount: [0.00],
      maxAmount: [10000000.00],
      exportFormat: ['PDF', Validators.required],
      includeOpeningClosing: [true],
      trailingNegative: [true],
      appendCryptoSignature: [true],
      suppressZeroBalance: [false]
    });

    this.lookupService.getAccounts().subscribe(accounts => {
      this.availableAccounts.set(accounts);
    });
  }

  setDatePreset(preset: string): void {
    this.activeDatePreset.set(preset);
    this.criteriaForm.patchValue({ datePreset: preset });
  }

  setExportFormat(format: 'PDF' | 'EXCEL' | 'SWIFT_MT940' | 'CSV'): void {
    this.criteriaForm.patchValue({ exportFormat: format });
  }

  removeAccount(accNo: string): void {
    this.selectedAccounts.update(list => list.filter(a => a !== accNo));
  }

  addAccount(accNo: string): void {
    if (!this.selectedAccounts().includes(accNo)) {
      this.selectedAccounts.update(list => [...list, accNo]);
    }
  }

  openLookup(): void {
    this.isLookupOpen.set(true);
  }

  closeLookup(): void {
    this.isLookupOpen.set(false);
  }

  onTemplateSelected(template: BaseReport): void {
    this.criteriaForm.patchValue({
      baseReportCode: template.reportCode,
      baseReportName: template.name
    });
  }

  toggleFxMenu(): void {
    this.isFxMenuOpen.update(v => !v);
  }

  selectFxOperator(op: string): void {
    this.selectedOperator.set(op);
    this.isFxMenuOpen.set(false);
  }

  saveCriteriaAndPreview(): void {
    if (this.criteriaForm.invalid) {
      this.criteriaForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const formValue = this.criteriaForm.getRawValue();

    const criteriaPayload: ReportCriteria = {
      baseReportId: formValue.baseReportCode,
      name: `${formValue.baseReportName} - ${formValue.currency}`,
      branchCode: formValue.branchCode.split(' - ')[0],
      accountNumbers: this.selectedAccounts(),
      currency: formValue.currency,
      datePreset: this.activeDatePreset(),
      dateFrom: formValue.dateFrom,
      dateTo: formValue.dateTo,
      transactionType: formValue.transactionType,
      minAmount: formValue.minAmount,
      maxAmount: formValue.maxAmount,
      exportFormat: formValue.exportFormat,
      includeOpeningClosing: formValue.includeOpeningClosing,
      trailingNegative: formValue.trailingNegative,
      appendCryptoSignature: formValue.appendCryptoSignature,
      suppressZeroBalance: formValue.suppressZeroBalance
    };

    this.reportService.generateReport(criteriaPayload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Criteria saved & report generated successfully! Report ID: ${res.id}`);
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  proceedToSchedule(): void {
    this.router.navigate(['/schedule']);
  }

  resetToDefaults(): void {
    this.criteriaForm.reset({
      baseReportCode: 'CASH_STMT_EOD',
      baseReportName: 'End of Day Consolidated Cash Statement',
      scopeType: 'specific',
      branchCode: 'NYC-001 - New York Main Branch',
      currency: 'USD',
      legalEntity: 'CITI-US-NA (Citibank N.A. New York)',
      dateMode: 'preset',
      datePreset: 'Last 30 Days',
      dateFrom: '2026-05-01 00:00 EST',
      dateTo: '2026-05-18 23:59 EST',
      transactionType: 'ALL',
      minAmount: 0.00,
      maxAmount: 10000000.00,
      exportFormat: 'PDF',
      includeOpeningClosing: true,
      trailingNegative: true,
      appendCryptoSignature: true,
      suppressZeroBalance: false
    });
    this.selectedAccounts.set(['CITI-US-99201488', 'CITI-GB-88402199']);
    this.activeDatePreset.set('Last 30 Days');
  }
}
