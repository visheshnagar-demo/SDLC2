import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReportCriteriaComponent } from './report-criteria.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { DeliveryOptionsService } from '../../../../core/services/delivery-options.service';
import { of, throwError } from 'rxjs';
import { DefaultCriteriaResponse } from '../../../../core/models/report.models';

describe('ReportCriteriaComponent', () => {
  let component: ReportCriteriaComponent;
  let fixture: ComponentFixture<ReportCriteriaComponent>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;
  let lookupServiceSpy: jasmine.SpyObj<LookupService>;
  let deliveryServiceSpy: jasmine.SpyObj<DeliveryOptionsService>;

  beforeEach(async () => {
    const rSpy = jasmine.createSpyObj('ReportService', [
      'getCriteriaDefaults',
      'getCriteriaById',
      'saveCriteria',
      'runReport'
    ]);
    const lSpy = jasmine.createSpyObj('LookupService', [
      'getBranches',
      'getCustomers',
      'getAccounts',
      'getCurrencies',
      'getDesignatedOwners'
    ]);
    const dSpy = jasmine.createSpyObj('DeliveryOptionsService', [
      'getDeliveryOptions'
    ]);

    rSpy.getCriteriaDefaults.and.returnValue(of({
      derivedReportName: '',
      baseReportName: 'Account Statement – Comprehensive',
      format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      signWithCertificate: false,
      compressWithWinzip: false,
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
      valueDateRadio: 'No Date Selected',
      pageBreaks: true,
      printCitibankChinaStamp: false,
      activityOnly: false,
      runInIncrementalMode: false,
      printSelectionCriteria: true
    }));

    await TestBed.configureTestingModule({
      imports: [ReportCriteriaComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ReportService, useValue: rSpy },
        { provide: LookupService, useValue: lSpy },
        { provide: DeliveryOptionsService, useValue: dSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportCriteriaComponent);
    component = fixture.componentInstance;
    reportServiceSpy = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    lookupServiceSpy = TestBed.inject(LookupService) as jasmine.SpyObj<LookupService>;
    deliveryServiceSpy = TestBed.inject(DeliveryOptionsService) as jasmine.SpyObj<DeliveryOptionsService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with exact default values required by specification', () => {
    fixture.detectChanges();

    const formVal = component.criteriaForm.getRawValue();

    expect(formVal.baseReportName).toBe('Account Statement – Comprehensive');
    expect(formVal.format).toBe('Adobe(PDF) requires Acrobat Reader (5.0 or higher)');
    expect(formVal.statementDateRadio).toBe('Yesterday');
    expect(formVal.valueDateRadio).toBe('No Date Selected');
    expect(formVal.pageBreaks).toBe(true);
    expect(formVal.printSelectionCriteria).toBe(true);
    expect(formVal.activityOnly).toBe(false);
    expect(formVal.designatedOwner).toBe('JUSTIN,JOHN');
    expect(formVal.share).toBe('PRIVATE');
    expect(formVal.transactionCode).toBe('Citi Transaction Codes');
    expect(formVal.cheques).toBe('Include Cheques');
    expect(formVal.baseCurrency).toBe('USD');
  });

  it('should call reportService.saveCriteria on save and update status message', () => {
    fixture.detectChanges();

    component.criteriaForm.patchValue({
      derivedReportName: 'My Custom Statement'
    });

    reportServiceSpy.saveCriteria.and.returnValue(of({
      id: 'crit-999',
      derivedReportName: 'My Custom Statement',
      baseReportName: 'Account Statement – Comprehensive',
      ownerUsername: 'JUSTIN,JOHN',
      format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      sharedPublic: false,
      favorite: false,
      criteria: {},
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }));

    component.onSave();

    expect(reportServiceSpy.saveCriteria).toHaveBeenCalled();
    expect(component.statusType).toBe('success');
    expect(component.statusMessage).toContain('Report criteria saved successfully');
  });

  it('should surface error message if saveCriteria fails', () => {
    fixture.detectChanges();

    component.criteriaForm.patchValue({
      derivedReportName: 'My Custom Statement'
    });

    reportServiceSpy.saveCriteria.and.returnValue(throwError(() => ({
      error: { message: 'Database constraint violation' }
    })));

    component.onSave();

    expect(component.statusType).toBe('error');
    expect(component.statusMessage).toContain('Database constraint violation');
  });
});
