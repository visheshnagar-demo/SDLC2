import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockHttpService } from './mock-http.service';
import { TransformWorkspaceData, CdmFieldMapping, LegacyReport } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TransformService {
  constructor(private mockHttp: MockHttpService) {}

  getReportCatalog(): Observable<LegacyReport[]> {
    return this.mockHttp.getReportCatalog();
  }

  getTransformWorkspace(reportId: string): Observable<TransformWorkspaceData> {
    return this.mockHttp.getTransformWorkspace(reportId);
  }

  saveCdmMappings(reportId: string, mappings: CdmFieldMapping[]): Observable<{ success: boolean; message: string }> {
    return this.mockHttp.saveCdmMappings(reportId, mappings);
  }
}
