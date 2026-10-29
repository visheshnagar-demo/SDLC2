import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MockHttpService } from './mock-http.service';
import { ValidationReportItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ValidateService {
  constructor(private mockHttp: MockHttpService) {}

  getValidationQueue(): Observable<ValidationReportItem[]> {
    return this.mockHttp.getValidationQueue();
  }
}
