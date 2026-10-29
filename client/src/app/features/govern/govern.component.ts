import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockHttpService } from '../../core/services/mock-http.service';
import {
  ExecutiveKPIs,
  StatusBreakdownItem,
  PlatformCapabilityItem,
  ExceptionItem
} from '../../core/models/models';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-govern-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    ProgressBarComponent,
    StatusBadgeComponent
  ],
  templateUrl: './govern.component.html',
  styleUrls: ['./govern.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GovernComponent implements OnInit {
  kpis: ExecutiveKPIs | null = null;
  statusBreakdown: StatusBreakdownItem[] = [];
  capabilities: PlatformCapabilityItem[] = [];
  exceptions: ExceptionItem[] = [];
  loading = true;

  constructor(
    private mockHttp: MockHttpService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.mockHttp.getExecutiveKPIs().subscribe(data => {
      this.kpis = data;
      this.cdr.markForCheck();
    });

    this.mockHttp.getStatusBreakdown().subscribe(data => {
      this.statusBreakdown = data;
      this.cdr.markForCheck();
    });

    this.mockHttp.getPlatformCapabilities().subscribe(data => {
      this.capabilities = data;
      this.cdr.markForCheck();
    });

    this.mockHttp.getExceptions().subscribe(data => {
      this.exceptions = data;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }
}
