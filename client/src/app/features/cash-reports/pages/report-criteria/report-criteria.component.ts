import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { DeliveryOptionsService } from '../../../../core/services/delivery-options.service';
import { ReportCriteria, StatementReportData } from '../../../../core/models/report.models';
import { BinocularLookupInputComponent } from '../../../../shared/components/binocular-lookup-input/binocular-lookup-input.component';
import { FxOperatorSelectComponent } from '../../../../shared/components/fx-operator-select/fx-operator-select.component';
import { GenericLookupModalComponent, LookupColumn } from '../../../../shared/components/generic-lookup-modal/generic-lookup-modal.component';
import { ReportViewerModalComponent } from '../../../../shared/components/report-viewer-modal/report-viewer-modal.component';

@Component({
  selector: 'app-report-criteria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    BinocularLookupInputComponent,
    FxOperatorSelectComponent,
    GenericLookupModalComponent,
    ReportViewerModalComponent
  ],
  templateUrl: './report-criteria.component.html',
  styleUrl: './report-criteria.component.scss'
})
export class ReportCriteriaComponent implements OnInit {
  criteriaForm!: FormGroup;
  isSpecificFieldsCollapsed = false;
  activeSubTab: 'CRITERIA' | 'SCHEDULE' | 'DELIVERY' = 'CRITERIA';

  formatOptions = [
    'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
    'DHTML',
    'Comma Separated Value (CSV)',
    'Excel (XLS)',
    'Rich Text Format (RTF)'
  ];

  transactionCodeOptions = [
    'Citi Transaction Codes',
    'SWIFT MT940 Codes',
    'BAI2 Codes',
    'ISO 20022 Codes'
  ];

  chequeOptions = [
    'Include Cheques',
    'Exclude Cheques',
    'Cheques Only'
  ];

  statementDateOptions = [
    'Current Month',
    'Previous Month',
    'Latest',
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 14 Days',
    'Last 30 Days',
    'Date Range'
  ];

  valueDateOptions = [
    'No Date Selected',
    'Current Month',
    'Previous Month',
    'Latest',
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 14 Days',
    'Last 30 Days',
    'Date Range'
  ];

  // Lookup Modals State
  activeLookupModal: 'BRANCH' | 'CUSTOMER' | 'ACCOUNT' | 'CURRENCY' | 'DELIVERY' | 'OWNER' | null = null;
  lookupTitle = '';
  lookupColumns: LookupColumn[] = [];
  lookupItems: any[] = [];
  lookupDisplayField = '';
  lookupValueField = '';

  // Viewer Modal State
  showViewerModal = false;
  statementData: StatementReportData | null = null;
  isRunningReport = false;
  isSavingReport = false;

  // Status message
  statusMessage = '';
  statusType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private lookupService: LookupService,
    private deliveryService: DeliveryOptionsService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.reportService.getCriteriaById(id).subscribe({
        next: (criteria) => {
          if (criteria) {
            this.criteriaForm.patchValue(criteria);
          }
        },
        error: (err) => {
          this.statusMessage = err.error?.message || 'Failed to load saved report criteria.';
          this.statusType = 'error';
        }
      });
    } else {
      this.reportService.getCriteriaDefaults().subscribe({
        next: (defaults) => {
          if (defaults) {
            this.criteriaForm.patchValue(defaults);
          }
        },
        error: () => {
          // Keep initialized defaults
        }
      });
    }
  }

  initForm(): void {
    this.criteriaForm = this.fb.group({
      id: [''],
      derivedReportName: ['', Validators.required],
      baseReportName: [{ value: 'Account Statement – Comprehensive', disabled: true }],
      format: ['Adobe(PDF) requires Acrobat Reader (5.0 or higher)', Validators.required],
      signWithCertificate: [false],
      compressWithWinzip: [false],
      deliveryOptionId: [''],
      deliveryOptionName: [''],
      designatedOwner: ['JUSTIN,JOHN'],
      share: ['PRIVATE'],
      favorite: [false],

      // Specific Fields
      branchNumberName: ['600 - A BRANCH NAME'],
      customerNumberName: ['0000244654 - A CUSTOMER NAME'],
      accountSelectionType: ['ACCOUNT'],
      accountNumberName: ['XX12CITI11223344446677 - AN ACCOUNT NAME'],
      bankReferenceOperator: ['Equals'],
      bankReferenceValue: [''],
      customerReferenceOperator: ['Equals'],
      customerReferenceValue: [''],
      transactionAmountFrom: [null],
      transactionAmountTo: [null],
      accountCurrency: ['GBP'],
      transactionDescriptionOperator: ['Equals'],
      transactionDescriptionValue: [''],
      byOrderBeneficiary: [''],
      transactionCode: ['Citi Transaction Codes'],
      cheques: ['Include Cheques', Validators.required],
      baseCurrency: ['USD', Validators.required],

      // Display options
      showEnhancedTransactionDetails: [false],
      outputAccountSubTotals: [false],
      outputGrandTotal: [false],
      showAdditionalOrderingPartyBeneficiary: [false],

      // Date Radios
      statementDateRadio: ['Yesterday', Validators.required],
      statementDateFrom: [''],
      statementDateTo: [''],
      valueDateRadio: ['No Date Selected'],
      valueDateFrom: [''],
      valueDateTo: [''],

      // Output Control Checkboxes
      pageBreaks: [true],
      printCitibankChinaStamp: [false],
      activityOnly: [false],
      runInIncrementalMode: [false],
      printSelectionCriteria: [true]
    });
  }

  toggleSpecificFields(): void {
    this.isSpecificFieldsCollapsed = !this.isSpecificFieldsCollapsed;
  }

  resetToDefaults(): void {
    this.reportService.getCriteriaDefaults().subscribe({
      next: (defaults) => {
        this.criteriaForm.reset(defaults);
        this.statusMessage = 'Report criteria reset to system defaults.';
        this.statusType = 'info';
        setTimeout(() => this.statusMessage = '', 4000);
      },
      error: () => {
        this.criteriaForm.reset({
          derivedReportName: '',
          baseReportName: 'Account Statement – Comprehensive',
          format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
          signWithCertificate: false,
          compressWithWinzip: false,
          deliveryOptionId: '',
          deliveryOptionName: '',
          designatedOwner: 'JUSTIN,JOHN',
          share: 'PRIVATE',
          favorite: false,
          branchNumberName: '600 - A BRANCH NAME',
          customerNumberName: '0000244654 - A CUSTOMER NAME',
          accountSelectionType: 'ACCOUNT',
          accountNumberName: 'XX12CITI11223344446677 - AN ACCOUNT NAME',
          bankReferenceOperator: 'Equals',
          bankReferenceValue: '',
          customerReferenceOperator: 'Equals',
          customerReferenceValue: '',
          transactionAmountFrom: null,
          transactionAmountTo: null,
          accountCurrency: 'GBP',
          transactionDescriptionOperator: 'Equals',
          transactionDescriptionValue: '',
          byOrderBeneficiary: '',
          transactionCode: 'Citi Transaction Codes',
          cheques: 'Include Cheques',
          baseCurrency: 'USD',
          showEnhancedTransactionDetails: false,
          outputAccountSubTotals: false,
          outputGrandTotal: false,
          showAdditionalOrderingPartyBeneficiary: false,
          statementDateRadio: 'Yesterday',
          statementDateFrom: '',
          statementDateTo: '',
          valueDateRadio: 'No Date Selected',
          valueDateFrom: '',
          valueDateTo: '',
          pageBreaks: true,
          printCitibankChinaStamp: false,
          activityOnly: false,
          runInIncrementalMode: false,
          printSelectionCriteria: true
        });
        this.statusMessage = 'Report criteria reset to system defaults.';
        this.statusType = 'info';
        setTimeout(() => this.statusMessage = '', 4000);
      }
    });
  }

  // Lookups
  openLookup(type: 'BRANCH' | 'CUSTOMER' | 'ACCOUNT' | 'CURRENCY' | 'DELIVERY' | 'OWNER'): void {
    this.activeLookupModal = type;
    if (type === 'BRANCH') {
      this.lookupTitle = 'Branch Number / Name Lookup';
      this.lookupColumns = [
        { field: 'branchNumber', header: 'Branch No', width: '100px' },
        { field: 'branchName', header: 'Branch Name' },
        { field: 'swiftCode', header: 'SWIFT BIC', width: '120px' }
      ];
      this.lookupService.getBranches().subscribe({
        next: (branches) => this.lookupItems = branches,
        error: (err) => {
          this.statusMessage = err.error?.message || 'Error fetching branches';
          this.statusType = 'error';
        }
      });
    } else if (type === 'CUSTOMER') {
      this.lookupTitle = 'Customer Number / Name Lookup';
      this.lookupColumns = [
        { field: 'customerNumber', header: 'Customer No', width: '130px' },
        { field: 'customerName', header: 'Customer Name' },
        { field: 'countryCode', header: 'Country', width: '140px' }
      ];
      this.lookupService.getCustomers().subscribe({
        next: (customers) => this.lookupItems = customers,
        error: (err) => {
          this.statusMessage = err.error?.message || 'Error fetching customers';
          this.statusType = 'error';
        }
      });
    } else if (type === 'ACCOUNT') {
      const isGroup = this.criteriaForm.get('accountSelectionType')?.value === 'ACCOUNT_GROUP';
      if (isGroup) {
        this.lookupTitle = 'Account Group Lookup';
        this.lookupColumns = [
          { field: 'code', header: 'Group Code', width: '140px' },
          { field: 'name', header: 'Group Description' }
        ];
        this.lookupItems = [
          { code: 'ALL', name: 'All Entitled Accounts (Customer/Branch)' },
          { code: 'CHECKING', name: 'Checking Accounts Group' },
          { code: 'OPERATING', name: 'Operating Treasury Group' },
          { code: 'SAVINGS', name: 'Savings & Regional Pools' }
        ];
      } else {
        this.lookupTitle = 'Account Number / Name Lookup';
        this.lookupColumns = [
          { field: 'accountNumber', header: 'Account Number', width: '180px' },
          { field: 'accountName', header: 'Account Name' },
          { field: 'currency', header: 'CCY', width: '60px' },
          { field: 'accountType', header: 'Type', width: '120px' }
        ];
        const custRaw = this.criteriaForm.get('customerNumberName')?.value || '';
        const branchRaw = this.criteriaForm.get('branchNumberName')?.value || '';
        const customerNumber = custRaw.split(' - ')[0].trim() || undefined;
        const branchNumber = branchRaw.split(' - ')[0].trim() || undefined;

        this.lookupService.getAccounts(customerNumber, branchNumber).subscribe({
          next: (accounts) => this.lookupItems = accounts,
          error: (err) => {
            this.statusMessage = err.error?.message || 'Error fetching accounts';
            this.statusType = 'error';
          }
        });
      }
    } else if (type === 'CURRENCY') {
      this.lookupTitle = 'Currency Lookup';
      this.lookupColumns = [
        { field: 'code', header: 'Currency Code', width: '100px' },
        { field: 'name', header: 'Currency Name' }
      ];
      this.lookupService.getCurrencies().subscribe({
        next: (currencies) => this.lookupItems = currencies,
        error: (err) => {
          this.statusMessage = err.error?.message || 'Error fetching currencies';
          this.statusType = 'error';
        }
      });
    } else if (type === 'DELIVERY') {
      this.lookupTitle = 'Delivery Options Lookup';
      this.lookupColumns = [
        { field: 'name', header: 'Delivery Option Name', width: '180px' },
        { field: 'description', header: 'Description' },
        { field: 'authStatus', header: 'Authorization Status', width: '150px' }
      ];
      this.deliveryService.getDeliveryOptions('ALL').subscribe({
        next: (options) => {
          this.lookupItems = options.filter(o => o.authStatus === 'AUTHORIZED');
        },
        error: (err) => {
          this.statusMessage = err.error?.message || 'Error fetching delivery options';
          this.statusType = 'error';
        }
      });
    } else if (type === 'OWNER') {
      this.lookupTitle = 'Designated Owner Lookup';
      this.lookupColumns = [
        { field: 'username', header: 'Username', width: '140px' },
        { field: 'fullName', header: 'Owner Name' },
        { field: 'email', header: 'Email' }
      ];
      this.lookupService.getDesignatedOwners().subscribe({
        next: (owners) => this.lookupItems = owners,
        error: (err) => {
          this.statusMessage = err.error?.message || 'Error fetching owners';
          this.statusType = 'error';
        }
      });
    }
  }

  onLookupSelect(item: any): void {
    if (this.activeLookupModal === 'BRANCH') {
      this.criteriaForm.patchValue({
        branchNumberName: `${item.branchNumber} - ${item.branchName}`
      });
    } else if (this.activeLookupModal === 'CUSTOMER') {
      this.criteriaForm.patchValue({
        customerNumberName: `${item.customerNumber} - ${item.customerName}`
      });
    } else if (this.activeLookupModal === 'ACCOUNT') {
      const isGroup = this.criteriaForm.get('accountSelectionType')?.value === 'ACCOUNT_GROUP';
      if (isGroup) {
        this.criteriaForm.patchValue({
          accountNumberName: item.code ? `${item.code} - ${item.name}` : item.name
        });
      } else {
        this.criteriaForm.patchValue({
          accountNumberName: `${item.accountNumber} - ${item.accountName}`,
          accountCurrency: item.currency
        });
      }
    } else if (this.activeLookupModal === 'CURRENCY') {
      this.criteriaForm.patchValue({
        accountCurrency: item.code
      });
    } else if (this.activeLookupModal === 'DELIVERY') {
      this.criteriaForm.patchValue({
        deliveryOptionId: item.id,
        deliveryOptionName: item.name
      });
    } else if (this.activeLookupModal === 'OWNER') {
      this.criteriaForm.patchValue({
        designatedOwner: item.fullName || item.username
      });
    }
    this.closeLookupModal();
  }

  closeLookupModal(): void {
    this.activeLookupModal = null;
  }

  // Execution Actions
  onRun(): void {
    const criteria = this.getCriteriaPayload();
    this.isRunningReport = true;
    this.statusMessage = 'Executing report and streaming generated output...';
    this.statusType = 'info';

    this.reportService.runReport(criteria).subscribe({
      next: (blob) => {
        this.isRunningReport = false;
        this.downloadBlob(blob, criteria.derivedReportName || criteria.baseReportName, criteria.format);
        this.statusMessage = 'Report generated and downloaded successfully.';
        this.statusType = 'success';
        setTimeout(() => this.statusMessage = '', 4000);
      },
      error: (err) => {
        this.isRunningReport = false;
        this.statusMessage = err.error?.message || err.message || 'Report execution failed. Check account entitlements and criteria.';
        this.statusType = 'error';
      }
    });
  }

  onSaveAndRun(): void {
    if (this.criteriaForm.invalid) {
      this.criteriaForm.markAllAsTouched();
      this.statusMessage = 'Please enter a Derived Report Name before saving.';
      this.statusType = 'error';
      return;
    }

    const criteria = this.getCriteriaPayload();
    this.isSavingReport = true;
    this.statusMessage = 'Saving report criteria...';
    this.statusType = 'info';

    this.reportService.saveCriteria(criteria).subscribe({
      next: (res) => {
        this.isSavingReport = false;
        this.criteriaForm.patchValue({ id: res.id });
        this.statusMessage = 'Criteria saved successfully. Running report...';
        this.statusType = 'success';
        this.onRun();
      },
      error: (err) => {
        this.isSavingReport = false;
        this.statusMessage = err.error?.message || err.message || 'Failed to save criteria. Please check required fields.';
        this.statusType = 'error';
      }
    });
  }

  onSave(): void {
    if (this.criteriaForm.invalid) {
      this.criteriaForm.markAllAsTouched();
      this.statusMessage = 'Please enter a Derived Report Name before saving.';
      this.statusType = 'error';
      return;
    }

    const criteria = this.getCriteriaPayload();
    this.isSavingReport = true;
    this.statusMessage = 'Saving report criteria...';
    this.statusType = 'info';

    this.reportService.saveCriteria(criteria).subscribe({
      next: (res) => {
        this.isSavingReport = false;
        this.criteriaForm.patchValue({ id: res.id });
        this.statusMessage = 'Report criteria saved successfully for reuse.';
        this.statusType = 'success';
        setTimeout(() => this.statusMessage = '', 5000);
      },
      error: (err) => {
        this.isSavingReport = false;
        this.statusMessage = err.error?.message || err.message || 'Failed to save criteria. Please check required fields.';
        this.statusType = 'error';
      }
    });
  }

  onSchedule(): void {
    const criteria = this.getCriteriaPayload();
    this.router.navigate(['/scheduling'], {
      queryParams: {
        reportName: criteria.derivedReportName || criteria.baseReportName,
        deliveryOptionId: criteria.deliveryOptionId
      }
    });
  }

  onQuickSchedule(): void {
    this.onSchedule();
  }

  private downloadBlob(blob: Blob, reportName: string, format: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = format.toLowerCase().includes('pdf') ? 'pdf' :
                format.toLowerCase().includes('csv') ? 'csv' :
                format.toLowerCase().includes('excel') || format.toLowerCase().includes('xls') ? 'xlsx' :
                format.toLowerCase().includes('rtf') ? 'rtf' : 'html';
    const cleanName = reportName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    a.download = `${cleanName}.${ext}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private getCriteriaPayload(): ReportCriteria {
    return {
      ...this.criteriaForm.getRawValue(),
      baseReportName: 'Account Statement – Comprehensive'
    };
  }
}
