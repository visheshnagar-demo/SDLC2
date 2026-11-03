import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { DeliveryOption } from '../models/report.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/delivery-options`;

  private mockDeliveryOptions: DeliveryOption[] = [
    {
      id: 'DEL-001',
      channelType: 'SFTP',
      destinationTarget: 'sftp.treasury.corp.acme.com:22',
      sftpFolderPath: '/incoming/statements/citi/',
      status: 'PENDING_AUTHORIZATION',
      encryptionProtocol: 'PGP_ENCRYPTED_AES256',
      sshKeyMethod: 'RSA_4096_ED25519',
      makerId: 'user_maker_01'
    },
    {
      id: 'DEL-002',
      channelType: 'EMAIL',
      destinationTarget: 'treasury-dispatch@corp.acme.com',
      status: 'ACTIVE',
      encryptionProtocol: 'TLS_1_3_STRICT',
      makerId: 'user_maker_02',
      checkerId: 'user_checker_01'
    },
    {
      id: 'DEL-003',
      channelType: 'PORTAL',
      destinationTarget: 'CitiDirect Document Vault Repository',
      status: 'ACTIVE',
      makerId: 'system_admin',
      checkerId: 'ops_checker'
    },
    {
      id: 'DEL-004',
      channelType: 'VAULT',
      destinationTarget: 'AWS S3 FedRAMP High Encrypted Bucket',
      sftpFolderPath: 's3://acme-treasury-citi-archive/2026/',
      status: 'PENDING_AUTHORIZATION',
      encryptionProtocol: 'AWS_KMS_CUSTOMER_KEY',
      makerId: 'user_maker_01'
    }
  ];

  getDeliveryOptions(): Observable<DeliveryOption[]> {
    return this.http.get<DeliveryOption[]>(this.baseUrl).pipe(
      catchError(() => of(this.mockDeliveryOptions))
    );
  }

  getPendingDeliveryOptions(): Observable<DeliveryOption[]> {
    return this.http.get<DeliveryOption[]>(`${this.baseUrl}/pending`).pipe(
      catchError(() => of(this.mockDeliveryOptions.filter(d => d.status === 'PENDING_AUTHORIZATION')))
    );
  }

  createDeliveryOption(option: Partial<DeliveryOption>): Observable<DeliveryOption> {
    return this.http.post<DeliveryOption>(this.baseUrl, option).pipe(
      catchError(() => {
        const newOpt: DeliveryOption = {
          id: `DEL-${Math.floor(100 + Math.random() * 900)}`,
          channelType: option.channelType || 'EMAIL',
          destinationTarget: option.destinationTarget || 'client@example.com',
          sftpFolderPath: option.sftpFolderPath,
          status: 'PENDING_AUTHORIZATION',
          encryptionProtocol: option.encryptionProtocol || 'TLS_1_3_STRICT',
          sshKeyMethod: option.sshKeyMethod,
          makerId: 'current_user_maker'
        };
        this.mockDeliveryOptions.unshift(newOpt);
        return of(newOpt);
      })
    );
  }

  authorizeDeliveryOption(id: string, checkerComments?: string): Observable<{ status: string; id: string }> {
    return this.http.post<{ status: string; id: string }>(`${this.baseUrl}/${id}/authorize`, {
      authorizationAction: 'AUTHORIZE',
      checkerComments: checkerComments || 'Approved by dual-control checker.'
    }).pipe(
      catchError(() => {
        const item = this.mockDeliveryOptions.find(d => d.id === id);
        if (item) {
          item.status = 'ACTIVE';
          item.checkerId = 'user_checker_01';
        }
        return of({ status: 'AUTHORIZED', id });
      })
    );
  }

  rejectDeliveryOption(id: string, rejectionReason: string): Observable<{ status: string; id: string }> {
    return this.http.post<{ status: string; id: string }>(`${this.baseUrl}/${id}/reject`, {
      authorizationAction: 'REJECT',
      rejectionReason: rejectionReason || 'Rejected by dual-control checker.'
    }).pipe(
      catchError(() => {
        const item = this.mockDeliveryOptions.find(d => d.id === id);
        if (item) {
          item.status = 'REJECTED';
          item.checkerId = 'user_checker_01';
          item.rejectionReason = rejectionReason;
        }
        return of({ status: 'REJECTED', id });
      })
    );
  }
}
