import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeliveryOption } from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private mockDeliveryOptions: DeliveryOption[] = [
    {
      id: 'del-001',
      scheduleId: 'SCHED-MT940-WEEKLY-001',
      deliveryChannel: 'SFTP',
      destinationConfig: {
        host: 'sftp.corporate.citi.com',
        port: 22,
        remotePath: '/treasury/statements/mt940/',
        authScheme: 'Dual-Key PGP / SSH Certificate',
        pgpEncryption: true,
        pgpKeyId: 'Citibank_Corporate_2026.pub (4096-bit RSA)'
      },
      status: 'PENDING_APPROVAL',
      makerId: 'usr_maker_01',
      makerName: 'M. Sterling (Senior Treasury Analyst)',
      createdAt: '2026-05-18 10:00:00 UTC'
    },
    {
      id: 'del-002',
      scheduleId: 'SCHED-BAI2-INTRADAY-002',
      deliveryChannel: 'SFTP',
      destinationConfig: {
        host: 'sftp.lon.citigroup.net',
        port: 2222,
        remotePath: '/feeds/intraday/bai2/',
        authScheme: 'SSH-RSA Key',
        pgpEncryption: true
      },
      status: 'PENDING_APPROVAL',
      makerId: 'usr_maker_02',
      makerName: 'R. Chen (Treasury Ops)',
      createdAt: '2026-05-18 09:30:00 UTC'
    },
    {
      id: 'del-003',
      scheduleId: 'SCHED-ZBA-DAILY-003',
      deliveryChannel: 'EMAIL',
      destinationConfig: {
        emailRecipients: ['treasury-ops@corp-client.com', 'recon-desk@corp-client.com'],
        pgpEncryption: true
      },
      status: 'PENDING_APPROVAL',
      makerId: 'usr_maker_03',
      makerName: 'K. Horvath (Maker)',
      createdAt: '2026-05-18 08:45:00 UTC'
    }
  ];

  getPendingDeliveries(): Observable<DeliveryOption[]> {
    return this.http.get<DeliveryOption[]>(`${this.baseUrl}/delivery-options/pending`).pipe(
      catchError(() => of(this.mockDeliveryOptions))
    );
  }

  createDeliveryOption(option: DeliveryOption): Observable<DeliveryOption> {
    return this.http.post<DeliveryOption>(`${this.baseUrl}/delivery-options`, option).pipe(
      catchError(() => {
        const created: DeliveryOption = {
          ...option,
          id: `del-${Date.now()}`,
          status: 'PENDING_APPROVAL',
          createdAt: new Date().toISOString()
        };
        this.mockDeliveryOptions.push(created);
        return of(created);
      })
    );
  }

  authorizeDeliveryOption(id: string, comments: string): Observable<DeliveryOption> {
    return this.http.post<DeliveryOption>(`${this.baseUrl}/delivery-options/${id}/authorize`, { comments }).pipe(
      catchError(() => {
        const index = this.mockDeliveryOptions.findIndex(d => d.id === id);
        if (index !== -1) {
          this.mockDeliveryOptions[index].status = 'AUTHORIZED';
          this.mockDeliveryOptions[index].checkerId = 'usr_checker_01';
          this.mockDeliveryOptions[index].checkerName = 'J. Vance (Tier 4 Authorizer)';
          this.mockDeliveryOptions[index].checkerComments = comments;
          this.mockDeliveryOptions[index].authorizedAt = new Date().toISOString();
          return of(this.mockDeliveryOptions[index]);
        }
        const fallback: DeliveryOption = {
          id,
          deliveryChannel: 'SFTP',
          destinationConfig: {},
          status: 'AUTHORIZED',
          checkerComments: comments,
          authorizedAt: new Date().toISOString()
        };
        return of(fallback);
      })
    );
  }

  rejectDeliveryOption(id: string, comments: string): Observable<DeliveryOption> {
    return this.http.post<DeliveryOption>(`${this.baseUrl}/delivery-options/${id}/reject`, { comments }).pipe(
      catchError(() => {
        const index = this.mockDeliveryOptions.findIndex(d => d.id === id);
        if (index !== -1) {
          this.mockDeliveryOptions[index].status = 'REJECTED';
          this.mockDeliveryOptions[index].checkerId = 'usr_checker_01';
          this.mockDeliveryOptions[index].checkerName = 'J. Vance (Tier 4 Authorizer)';
          this.mockDeliveryOptions[index].checkerComments = comments;
          return of(this.mockDeliveryOptions[index]);
        }
        const fallback: DeliveryOption = {
          id,
          deliveryChannel: 'SFTP',
          destinationConfig: {},
          status: 'REJECTED',
          checkerComments: comments
        };
        return of(fallback);
      })
    );
  }
}
