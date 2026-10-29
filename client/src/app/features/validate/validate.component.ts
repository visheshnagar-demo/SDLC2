import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockHttpService } from '../../core/services/mock-http.service';
import { ValidationReportItem, ValidationCheckItem } from '../../core/models/models';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ReadinessScoreComponent } from '../../shared/components/readiness-score/readiness-score.component';

@Component({
  selector: 'app-validate-queue',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgeComponent,
    ReadinessScoreComponent
  ],
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidateComponent implements OnInit {
  queue: ValidationReportItem[] = [];
  selectedItem: ValidationReportItem | null = null;
  activeTab: 'metadata' | 'rules' | 'dependencies' | 'preview' = 'metadata';
  loading = false;

  constructor(
    private mockHttp: MockHttpService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadValidationQueue();
  }

  loadValidationQueue(): void {
    this.loading = true;
    this.mockHttp.getValidationQueue().subscribe(items => {
      this.queue = items;
      if (items.length > 0) {
        this.selectedItem = items[0];
      }
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  selectReport(item: ValidationReportItem): void {
    this.selectedItem = item;
    this.cdr.markForCheck();
  }

  setTab(tab: 'metadata' | 'rules' | 'dependencies' | 'preview'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  getPreviewKeys(item: ValidationReportItem): string[] {
    if (!item.previewData || item.previewData.length === 0) return [];
    return Object.keys(item.previewData[0]);
  }
}
