import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';
import { ApiService } from './api.service';
import { of, throwError } from 'rxjs';
import { DefaultCriteriaResponse, DerivedReportResponse, ReportCriteria } from '../models/report.models';

describe('ReportService', () => {
  let service: ReportService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', [
      'get',
      'post',
      'put',
      'delete',
      'downloadFile',
      'getFile'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ReportService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(ReportService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch base reports from /api/v1/reports/base', (done) => {
    const mockReports = [
      { id: '1', reportName: 'Account Statement – Comprehensive', baseReportName: 'Account Statement – Comprehensive', isBase: true, category: 'Cash Statements Reports', reportType: 'Standard' }
    ];
    apiSpy.get.and.returnValue(of(mockReports));

    service.getBaseReports().subscribe((reports) => {
      expect(reports).toEqual(mockReports);
      expect(apiSpy.get).toHaveBeenCalledWith('/api/v1/reports/base');
      done();
    });
  });

  it('should map criteria defaults from /api/v1/reports/criteria/defaults', (done) => {
    const mockDefaults: DefaultCriteriaResponse = {
      baseReportName: 'Account Statement – Comprehensive',
      derivedReportName: '',
      format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      signWithCertificate: false,
      compressWithWinzip: false,
      designatedOwner: 'JUSTIN,JOHN',
      share: 'PRIVATE',
      favorite: false,
      accountSelectionType: 'ACCOUNT',
      transactionCode: 'Citi Transaction Codes',
      cheques: 'Include Cheques',
      baseCurrency: 'USD',
      showEnhancedTransactionDetails: false,
      outputAccountSubTotals: false,
      outputGrandTotal: false,
      showAdditionalOrderingPartyDetails: false,
      statementDateRadio: 'YESTERDAY',
      valueDateRadio: 'NO_DATE_SELECTED',
      pageBreaks: true,
      printChinaStamp: false,
      activityOnly: false,
      runInIncrementalMode: false,
      printSelectionCriteria: true,
      criteriaPayload: {
        branchNumber: '600',
        customerNumber: '0000244654',
        accountNumber: 'XX12CITI11223344446677'
      }
    };
    apiSpy.get.and.returnValue(of(mockDefaults));

    service.getCriteriaDefaults().subscribe((criteria) => {
      expect(criteria.baseReportName).toBe('Account Statement – Comprehensive');
      expect(criteria.statementDateRadio).toBe('Yesterday');
      expect(criteria.branchNumberName).toBe('600');
      expect(criteria.customerNumberName).toBe('0000244654');
      done();
    });
  });

  it('should send post request to /api/v1/reports/criteria when saving new criteria', (done) => {
    const criteria: ReportCriteria = {
      derivedReportName: 'My Custom Statement',
      baseReportName: 'Account Statement – Comprehensive',
      format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      signWithCertificate: false,
      compressWithWinzip: false,
      designatedOwner: 'JUSTIN,JOHN',
      share: 'PRIVATE',
      favorite: false,
      branchNumberName: '600 - LONDON',
      customerNumberName: '0000244654 - ACME',
      accountSelectionType: 'ACCOUNT',
      accountNumberName: 'XX12CITI11223344446677 - MAIN',
      bankReferenceOperator: 'Equals',
      bankReferenceValue: 'REF123',
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
    };

    const mockResponse: DerivedReportResponse = {
      id: 'crit-123',
      derivedReportName: 'My Custom Statement',
      baseReportName: 'Account Statement – Comprehensive',
      ownerUsername: 'JUSTIN,JOHN',
      format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      sharedPublic: false,
      favorite: false,
      criteria: {
        branchNumber: '600',
        customerNumber: '0000244654',
        accountNumber: 'XX12CITI11223344446677'
      },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    apiSpy.post.and.returnValue(of(mockResponse));

    service.saveCriteria(criteria).subscribe((res) => {
      expect(res.id).toBe('crit-123');
      expect(apiSpy.post).toHaveBeenCalled();
      const callArgs = apiSpy.post.calls.mostRecent().args;
      expect(callArgs[0]).toBe('/api/v1/reports/criteria');
      expect(callArgs[1].derivedReportName).toBe('My Custom Statement');
      expect(callArgs[1].criteria.branchNumber).toBe('600');
      done();
    });
  });

  it('should call downloadFile on /api/v1/reports/execution/run when running report', (done) => {
    const criteria: ReportCriteria = {
      derivedReportName: 'Test Report',
      baseReportName: 'Account Statement – Comprehensive',
      format: 'Adobe(PDF) requires Acrobat Reader (5.0 or higher)',
      signWithCertificate: false,
      compressWithWinzip: false,
      designatedOwner: 'JUSTIN,JOHN',
      share: 'PRIVATE',
      favorite: false,
      accountSelectionType: 'ACCOUNT',
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
    };

    const dummyBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    apiSpy.downloadFile.and.returnValue(of(dummyBlob));

    service.runReport(criteria).subscribe((blob) => {
      expect(blob).toEqual(dummyBlob);
      expect(apiSpy.downloadFile).toHaveBeenCalled();
      const callArgs = apiSpy.downloadFile.calls.mostRecent().args;
      expect(callArgs[0]).toBe('/api/v1/reports/execution/run');
      done();
    });
  });
});
