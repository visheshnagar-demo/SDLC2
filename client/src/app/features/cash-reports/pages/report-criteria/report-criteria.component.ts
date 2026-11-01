import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { DeliveryOptionsService } from '../../../../core/services/delivery-options.service';
import { ReportCriteria, StatementReportData } from '../../../../core/models/report.models';
import { Branch, Customer, Account } from '../../../../core/models/entitlement.models';
import { DeliveryOption } from '../../../../core/models/delivery.models';
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
      this.reportService.getCriteriaById(id).subscribe(criteria => {
        if (criteria) {
          this.criteriaForm.patchValue(criteria);
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
    const defaults = this.reportService.getMockCriteriaDefaults();
    this.criteriaForm.reset(defaults);
    this.statusMessage = 'Report criteria reset to system defaults.';
    this.statusType = 'info';
    setTimeout(() => this.statusMessage = '', 4000);
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
      this.lookupService.getBranches().subscribe(branches => {
        this.lookupItems = branches;
      });
    } else if (type === 'CUSTOMER') {
      this.lookupTitle = 'Customer Number / Name Lookup';
      this.lookupColumns = [
        { field: 'customerNumber', header: 'Customer No', width: '130px' },
        { field: 'customerName', header: 'Customer Name' },
        { field: 'country', header: 'Country', width: '140px' }
      ];
      this.lookupService.getCustomers().subscribe(customers => {
        this.lookupItems = customers;
      });
    } else if (type === 'ACCOUNT') {
      this.lookupTitle = 'Account Number / Name Lookup';
      this.lookupColumns = [
        { field: 'accountNumber', header: 'Account Number', width: '180px' },
        { field: 'accountName', header: 'Account Name' },
        { field: 'currency', header: 'CCY', width: '60px' },
        { field: 'accountType', header: 'Type', width: '120px' }
      ];
      this.lookupService.getAccounts().subscribe(accounts => {
        this.lookupItems = accounts;
      });
    } else if (type === 'CURRENCY') {
      this.lookupTitle = 'Currency Lookup';
      this.lookupColumns = [
        { field: 'code', header: 'Currency Code' }
      ];
      this.lookupService.getCurrencies().subscribe(currencies => {
        this.lookupItems = currencies.map(c => ({ code: c }));
      });
    } else if (type === 'DELIVERY') {
      this.lookupTitle = 'Delivery Options Lookup';
      this.lookupColumns = [
        { field: 'name', header: 'Delivery Option Name', width: '180px' },
        { field: 'description', header: 'Description' },
        { field: 'authStatus', header: 'Authorization Status', width: '150px' }
      ];
      this.deliveryService.getDeliveryOptions('ALL').subscribe(options => {
        this.lookupItems = options.filter(o => o.authStatus === 'AUTHORIZED');
      });
    } else if (type === 'OWNER') {
      this.lookupTitle = 'Designated Owner Lookup';
      this.lookupColumns = [
        { field: 'name', header: 'Owner Name' }
      ];
      this.lookupService.getDesignatedOwners().subscribe(owners => {
        this.lookupItems = owners.map(o => ({ name: o }));
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
      this.criteriaForm.patchValue({
        accountNumberName: `${item.accountNumber} - ${item.accountName}`,
        accountCurrency: item.currency
      });
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
        designatedOwner: item.name
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
    this.reportService.runReport(criteria).subscribe(data => {
      this.statementData = data;
      this.showViewerModal = true;
    });
  }

  onSaveAndRun(): void {
    const criteria = this.getCriteriaPayload();
    this.reportService.saveCriteria(criteria).subscribe(res => {
      this.criteriaForm.patchValue({ id: res.id });
      this.statusMessage = 'Criteria saved successfully. Running report...';
      this.statusType = 'success';
      this.onRun();
    });
  }

  onSave(): void {
    const criteria = this.getCriteriaPayload();
    this.reportService.saveCriteria(criteria).subscribe(res => {
      this.criteriaForm.patchValue({ id: res.id });
      this.statusMessage = 'Report criteria saved successfully for reuse.';
      this.statusType = 'success';
      setTimeout(() => this.statusMessage = '', 4000);
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

  private getCriteriaPayload(): ReportCriteria {
    return {
      ...this.criteriaForm.getRawValue(),
      baseReportName: 'Account Statement – Comprehensive'
    };
  }
}
