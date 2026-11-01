import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DeliveryOption,
  DeliveryOptionRequest,
  AuthorizationRequest,
  TabCountsResponse
} from '../models/delivery.models';

@Injectable({
  providedIn: 'root'
})
export class DeliveryOptionsService {
  constructor(private api: ApiService) {}

  getDeliveryOptions(tab: 'ALL' | 'TO_SUBMIT' | 'TO_AUTHORIZE' | string = 'ALL'): Observable<DeliveryOption[]> {
    return this.api.get<DeliveryOption[]>('/api/v1/delivery-options', { tab });
  }

  getTabCounts(): Observable<TabCountsResponse> {
    return this.api.get<TabCountsResponse>('/api/v1/delivery-options/counts');
  }

  getDeliveryOptionById(id: string): Observable<DeliveryOption> {
    return this.api.get<DeliveryOption>(`/api/v1/delivery-options/${id}`);
  }

  createDeliveryOption(request: DeliveryOptionRequest): Observable<DeliveryOption> {
    return this.api.post<DeliveryOption>('/api/v1/delivery-options', request);
  }

  updateDeliveryOption(id: string, request: DeliveryOptionRequest): Observable<DeliveryOption> {
    return this.api.put<DeliveryOption>(`/api/v1/delivery-options/${id}`, request);
  }

  authorizeDeliveryOption(id: string, actionReq: AuthorizationRequest): Observable<DeliveryOption> {
    return this.api.post<DeliveryOption>(`/api/v1/delivery-options/${id}/authorize`, actionReq);
  }

  deleteDeliveryOption(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/delivery-options/${id}`);
  }

  testConnectivity(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/api/v1/delivery-options/${id}/test-connectivity`, {});
  }
}
