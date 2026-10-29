import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockHttpService } from './mock-http.service';
import { LegacyReport, ReportDetail } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DiscoverService {
  constructor(private mockHttp: MockHttpService) {}

  getReportCatalog(): Observable<LegacyReport[]> {
    return this.mockHttp.getReportCatalog();
  }

  getReportDetail(reportId: string): Observable<ReportDetail> {
    return this.mockHttp.getReportDetail(reportId);
  }
}
