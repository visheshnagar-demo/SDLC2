import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MakerCheckerRequest } from '../models/cash-statement.model';

@Injectable({
  providedIn: 'root'
})
export class MakerCheckerService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/cash-statements/authorizations';

  getPendingAuthorizations(): Observable<MakerCheckerRequest[]> {
    return this.http.get<MakerCheckerRequest[]>(`${this.baseUrl}/pending`);
  }

  approveRequest(id: string, comments: string = 'Approved'): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/approve`, { comments });
  }

  rejectRequest(id: string, comments: string = 'Rejected'): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/reject`, { comments });
  }
}
