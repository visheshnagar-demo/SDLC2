import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GovernService } from '../../core/services/govern.service';
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
    private governService: GovernService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.governService.getExecutiveKPIs().subscribe(data => {
      this.kpis = data;
      this.cdr.markForCheck();
    });

    this.governService.getStatusBreakdown().subscribe(data => {
      this.statusBreakdown = data;
      this.cdr.markForCheck();
    });

    this.governService.getPlatformCapabilities().subscribe(data => {
      this.capabilities = data;
      this.cdr.markForCheck();
    });

    this.governService.getExceptions().subscribe(data => {
      this.exceptions = data;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }
}
