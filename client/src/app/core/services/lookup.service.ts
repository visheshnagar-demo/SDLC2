import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Branch, Customer, Account, UserProfile } from '../models/entitlement.models';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  constructor(private api: ApiService) {}

  getBranches(): Observable<Branch[]> {
    return this.api.get<Branch[]>('/api/v1/entitlements/branches').pipe(
      catchError(() => of(this.getMockBranches()))
    );
  }

  getCustomers(): Observable<Customer[]> {
    return this.api.get<Customer[]>('/api/v1/entitlements/customers').pipe(
      catchError(() => of(this.getMockCustomers()))
    );
  }

  getAccounts(): Observable<Account[]> {
    return this.api.get<Account[]>('/api/v1/entitlements/accounts').pipe(
      catchError(() => of(this.getMockAccounts()))
    );
  }

  getCurrencies(): Observable<string[]> {
    return of(['GBP', 'USD', 'EUR', 'JPY', 'CAD', 'AUD', 'CHF', 'HKD', 'SGD', 'CNY']);
  }

  getDesignatedOwners(): Observable<string[]> {
    return of(['JUSTIN,JOHN', 'SMITH,SARAH', 'DAVIS,MICHAEL', 'WILLIAMS,EMMA']);
  }

  getCurrentUser(): Observable<UserProfile> {
    return of({
      id: 'USR-101',
      username: 'jjustin',
      fullName: 'JUSTIN,JOHN',
      role: 'MAKER',
      timeZone: 'GMT (UTC+0)'
    });
  }

  getMockBranches(): Branch[] {
    return [
      { branchNumber: '600', branchName: 'A BRANCH NAME (LONDON)', swiftCode: 'CITIGB2L', supportsRunningBalance: true },
      { branchNumber: '100', branchName: 'CITIBANK NEW YORK', swiftCode: 'CITIUS33', supportsRunningBalance: true },
      { branchNumber: '400', branchName: 'CITIBANK FRANKFURT', swiftCode: 'CITIDEFF', supportsRunningBalance: true },
      { branchNumber: '920', branchName: 'CITIBANK SINGAPORE', swiftCode: 'CITISGSG', supportsRunningBalance: false },
      { branchNumber: '930', branchName: 'CITIBANK HONG KONG', swiftCode: 'CITIHKHX', supportsRunningBalance: false },
      { branchNumber: '940', branchName: 'CITIBANK TOKYO', swiftCode: 'CITIJPJT', supportsRunningBalance: false }
    ];
  }

  getMockCustomers(): Customer[] {
    return [
      { customerNumber: '0000244654', customerName: 'A CUSTOMER NAME', country: 'United Kingdom' },
      { customerNumber: '0000100982', customerName: 'GLOBAL CONSOLIDATED HOLDINGS', country: 'United States' },
      { customerNumber: '0000355120', customerName: 'EUROPEAN TREASURY SERVICES NV', country: 'Germany' }
    ];
  }

  getMockAccounts(): Account[] {
    return [
      { accountNumber: 'XX12CITI11223344446677', accountName: 'AN ACCOUNT NAME (OPERATING)', currency: 'GBP', accountType: 'Current Account', branchNumber: '600', customerNumber: '0000244654', currentBalance: 1103501.82 },
      { accountNumber: 'XX12CITI99887766554433', accountName: 'PAYROLL CONCENTRATION GBP', currency: 'GBP', accountType: 'Disbursement Account', branchNumber: '600', customerNumber: '0000244654', currentBalance: 450000.00 },
      { accountNumber: 'US33CITI10002223334445', accountName: 'USD LIQUIDITY SWEEP ACCOUNT', currency: 'USD', accountType: 'Operating Account', branchNumber: '100', customerNumber: '0000100982', currentBalance: 5240190.50 },
      { accountNumber: 'DE44CITI40005556667778', accountName: 'EUR EUROZONE TREASURY ACC', currency: 'EUR', accountType: 'Operating Account', branchNumber: '400', customerNumber: '0000355120', currentBalance: 875200.25 }
    ];
  }
}
