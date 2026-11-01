import { TestBed } from '@angular/core/testing';
import { DeliveryOptionsService } from './delivery-options.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { DeliveryOption, DeliveryOptionRequest, AuthorizationRequest, TabCountsResponse } from '../models/delivery.models';

describe('DeliveryOptionsService', () => {
  let service: DeliveryOptionsService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', [
      'get',
      'post',
      'put',
      'delete'
    ]);

    TestBed.configureTestingModule({
      providers: [
        DeliveryOptionsService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(DeliveryOptionsService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch delivery options by tab from /api/v1/delivery-options', (done) => {
    const mockOptions: DeliveryOption[] = [
      {
        id: 'del-1',
        name: 'DAILY_TREASURY_EMAIL',
        description: 'Daily statement',
        deliveryType: 'E-Mail',
        securityMethod: 'Citi Secure E-Mail',
        emailRecipients: 'ops@client.com',
        emailSubject: 'Statement',
        fileName: 'report.pdf',
        authStatus: 'AUTHORIZED'
      }
    ];

    apiSpy.get.and.returnValue(of(mockOptions));

    service.getDeliveryOptions('TO_AUTHORIZE').subscribe((options) => {
      expect(options).toEqual(mockOptions);
      expect(apiSpy.get).toHaveBeenCalledWith('/api/v1/delivery-options', { tab: 'TO_AUTHORIZE' });
      done();
    });
  });

  it('should fetch tab counts from /api/v1/delivery-options/counts', (done) => {
    const mockCounts: TabCountsResponse = {
      all: 10,
      toAuthorize: 3,
      toSubmit: 1
    };

    apiSpy.get.and.returnValue(of(mockCounts));

    service.getTabCounts().subscribe((counts) => {
      expect(counts.all).toBe(10);
      expect(counts.toAuthorize).toBe(3);
      expect(counts.toSubmit).toBe(1);
      expect(apiSpy.get).toHaveBeenCalledWith('/api/v1/delivery-options/counts');
      done();
    });
  });

  it('should post authorization request to /api/v1/delivery-options/{id}/authorize', (done) => {
    const authReq: AuthorizationRequest = {
      action: 'AUTHORIZE',
      comment: 'Approved by checker'
    };

    const mockResponse: DeliveryOption = {
      id: 'del-1',
      name: 'DAILY_TREASURY_EMAIL',
      description: 'Daily statement',
      deliveryType: 'E-Mail',
      securityMethod: 'Citi Secure E-Mail',
      emailRecipients: 'ops@client.com',
      emailSubject: 'Statement',
      fileName: 'report.pdf',
      authStatus: 'AUTHORIZED'
    };

    apiSpy.post.and.returnValue(of(mockResponse));

    service.authorizeDeliveryOption('del-1', authReq).subscribe((res) => {
      expect(res.authStatus).toBe('AUTHORIZED');
      expect(apiSpy.post).toHaveBeenCalledWith('/api/v1/delivery-options/del-1/authorize', authReq);
      done();
    });
  });
});
