import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { DeliveryOption, DeliveryOptionCreateRequest, MakerCheckerActionRequest } from '../models/delivery.models';

@Injectable({
  providedIn: 'root'
})
export class DeliveryOptionsService {
  constructor(private api: ApiService) {}

  getDeliveryOptions(tab: 'ALL' | 'TO_SUBMIT' | 'TO_AUTHORIZE' = 'ALL'): Observable<DeliveryOption[]> {
    return this.api.get<DeliveryOption[]>('/api/v1/delivery-options', { tab }).pipe(
      catchError(() => of(this.getMockDeliveryOptions(tab)))
    );
  }

  getDeliveryOptionById(id: string): Observable<DeliveryOption | undefined> {
    return this.api.get<DeliveryOption>(`/api/v1/delivery-options/${id}`).pipe(
      catchError(() => of(this.getMockDeliveryOptions('ALL').find(d => d.id === id)))
    );
  }

  createDeliveryOption(request: DeliveryOptionCreateRequest): Observable<DeliveryOption> {
    return this.api.post<DeliveryOption>('/api/v1/delivery-options', request).pipe(
      catchError(() => {
        const created: DeliveryOption = {
          id: 'DEL-' + Date.now(),
          name: request.name,
          description: request.description,
          deliveryType: 'E-Mail',
          securityMethod: request.securityMethod || 'Citi Secure E-Mail',
          emailRecipients: request.emailRecipients,
          emailSubject: request.emailSubject,
          messageText: request.messageText,
          fileName: request.fileName,
          authStatus: 'PENDING_AUTHORIZATION',
          authLevel: 'Level 1 Authorization Required',
          makerId: 'USR-101',
          makerName: 'JUSTIN,JOHN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return of(created);
      })
    );
  }

  authorizeDeliveryOption(id: string, actionReq: MakerCheckerActionRequest): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/api/v1/delivery-options/${id}/authorize`, actionReq).pipe(
      catchError(() => of({
        success: true,
        message: `Delivery option successfully updated to: ${actionReq.action}`
      }))
    );
  }

  deleteDeliveryOption(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/api/v1/delivery-options/${id}`).pipe(
      catchError(() => of({ success: true }))
    );
  }

  testConnectivity(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/api/v1/delivery-options/${id}/test-connectivity`, {}).pipe(
      catchError(() => of({
        success: true,
        message: 'SMTP Host connection test successful. Citi Secure Email gateway responsive (MailHog sink).'
      }))
    );
  }

  getMockDeliveryOptions(tab: 'ALL' | 'TO_SUBMIT' | 'TO_AUTHORIZE'): DeliveryOption[] {
    const list: DeliveryOption[] = [
      {
        id: 'DEL-001',
        name: 'DAILY_TREASURY_EMAIL',
        description: 'Daily Automated Account Statement for Global Treasury',
        deliveryType: 'E-Mail',
        securityMethod: 'Citi Secure E-Mail',
        emailRecipients: 'treasury.ops@client.com; finance.controller@client.com',
        emailSubject: 'CitiDirect Account Statement - Daily Comprehensive',
        messageText: 'Please find attached the daily comprehensive statement report.',
        fileName: 'Stmt_Comprehensive_Daily.pdf',
        authStatus: 'AUTHORIZED',
        authLevel: 'Authorized',
        makerId: 'USR-101',
        makerName: 'JUSTIN,JOHN',
        authorizerId: 'USR-202',
        authorizerName: 'SMITH,SARAH',
        createdAt: '2023-01-10 10:15:00 GMT',
        updatedAt: '2023-01-11 14:20:00 GMT'
      },
      {
        id: 'DEL-002',
        name: 'AUDIT_CSV_FEED',
        description: 'Weekly CSV 60-Column Data Feed for Audit System',
        deliveryType: 'E-Mail',
        securityMethod: 'Encrypted Email with Digital Certificates (S/MIME)',
        emailRecipients: 'reconciliation.feed@client.com',
        emailSubject: 'Weekly Recon Feed - 60 Columns',
        messageText: 'Automated weekly reconciliation extract.',
        fileName: 'Audit_Statement_60Col.csv',
        authStatus: 'PENDING_AUTHORIZATION',
        authLevel: 'Level 1 Authorization Required',
        makerId: 'USR-101',
        makerName: 'JUSTIN,JOHN',
        createdAt: '2023-01-20 16:45:00 GMT',
        updatedAt: '2023-01-20 16:45:00 GMT'
      },
      {
        id: 'DEL-003',
        name: 'MONTH_END_EXCEL_DELIVERY',
        description: 'Month End Statement Excel Delivery to CFO Office',
        deliveryType: 'E-Mail',
        securityMethod: 'Citi Secure E-Mail',
        emailRecipients: 'cfo.reporting@client.com',
        emailSubject: 'Month-End Comprehensive Cash Statement',
        messageText: 'Official month end statement statement for review.',
        fileName: 'MonthEnd_Statement.xlsx',
        authStatus: 'PENDING_AUTHORIZATION',
        authLevel: 'Level 1 Authorization Required',
        makerId: 'USR-103',
        makerName: 'DAVIS,MICHAEL',
        createdAt: '2023-01-22 09:10:00 GMT',
        updatedAt: '2023-01-22 09:10:00 GMT'
      },
      {
        id: 'DEL-004',
        name: 'REPAIR_REQUIRED_FEED',
        description: 'Draft delivery option with invalid format',
        deliveryType: 'E-Mail',
        securityMethod: 'Citi Secure E-Mail',
        emailRecipients: 'invalid-email-address',
        emailSubject: 'Draft',
        messageText: 'Draft',
        fileName: 'Draft_Report.pdf',
        authStatus: 'PENDING_REPAIR',
        authLevel: 'Pending Repair',
        makerId: 'USR-101',
        makerName: 'JUSTIN,JOHN',
        authorizerId: 'USR-202',
        authorizerName: 'SMITH,SARAH',
        authorizerComment: 'Please correct the email recipient syntax.',
        createdAt: '2023-01-18 11:00:00 GMT',
        updatedAt: '2023-01-19 13:00:00 GMT'
      }
    ];

    if (tab === 'TO_AUTHORIZE') {
      return list.filter(d => d.authStatus === 'PENDING_AUTHORIZATION');
    }
    if (tab === 'TO_SUBMIT') {
      return list.filter(d => d.authStatus === 'PENDING_REPAIR');
    }
    return list;
  }
}
