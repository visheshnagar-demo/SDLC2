import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Branch, Customer, Account, UserProfile } from '../models/entitlement.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  getBranches(query?: string): Observable<Branch[]> {
    return this.api.get<Branch[]>('/api/v1/lookups/branches', query ? { query } : undefined);
  }

  getCustomers(query?: string): Observable<Customer[]> {
    return this.api.get<Customer[]>('/api/v1/lookups/customers', query ? { query } : undefined);
  }

  getAccounts(customerNumber?: string, branchNumber?: string, query?: string): Observable<Account[]> {
    return this.api.get<Account[]>('/api/v1/lookups/accounts', {
      customerNumber,
      branchNumber,
      query
    });
  }

  getCurrencies(): Observable<{ code: string; name: string }[]> {
    return this.api.get<{ code: string; name: string }[]>('/api/v1/lookups/currencies');
  }

  getTransactionDescriptions(): Observable<{ code: string; description: string }[]> {
    return this.api.get<{ code: string; description: string }[]>('/api/v1/lookups/transaction-descriptions');
  }

  getDesignatedOwners(): Observable<{ username: string; fullName: string; email: string }[]> {
    return this.api.get<{ username: string; fullName: string; email: string }[]>('/api/v1/lookups/owners');
  }

  getTransactionCodes(): Observable<string[]> {
    return this.api.get<string[]>('/api/v1/lookups/transaction-codes');
  }

  getCurrentUser(): Observable<UserProfile> {
    return new Observable<UserProfile>((observer) => {
      observer.next(this.authService.getCurrentUser());
      observer.complete();
    });
  }
}
