import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockHttpService } from './mock-http.service';
import {
  ExecutiveKPIs,
  StatusBreakdownItem,
  PlatformCapabilityItem,
  ExceptionItem
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GovernService {
  constructor(private mockHttp: MockHttpService) {}

  getExecutiveKPIs(): Observable<ExecutiveKPIs> {
    return this.mockHttp.getExecutiveKPIs();
  }

  getStatusBreakdown(): Observable<StatusBreakdownItem[]> {
    return this.mockHttp.getStatusBreakdown();
  }

  getPlatformCapabilities(): Observable<PlatformCapabilityItem[]> {
    return this.mockHttp.getPlatformCapabilities();
  }

  getExceptions(): Observable<ExceptionItem[]> {
    return this.mockHttp.getExceptions();
  }
}
