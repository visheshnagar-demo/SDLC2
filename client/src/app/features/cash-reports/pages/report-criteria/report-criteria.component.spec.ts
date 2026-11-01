import { TestBed } from '@angular/core/testing';
import { ReportCriteriaComponent } from './report-criteria.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('ReportCriteriaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCriteriaComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ReportCriteriaComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should initialize with exact default values required by specification', () => {
    const fixture = TestBed.createComponent(ReportCriteriaComponent);
    const component = fixture.componentInstance;
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

  it('should reset to defaults when resetToDefaults is called', () => {
    const fixture = TestBed.createComponent(ReportCriteriaComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.criteriaForm.patchValue({
      derivedReportName: 'Modified Name',
      format: 'Comma Separated Value (CSV)',
      statementDateRadio: 'Current Month'
    });

    component.resetToDefaults();

    const formVal = component.criteriaForm.getRawValue();
    expect(formVal.format).toBe('Adobe(PDF) requires Acrobat Reader (5.0 or higher)');
    expect(formVal.statementDateRadio).toBe('Yesterday');
  });
});
