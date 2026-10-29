import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransformService } from '../../core/services/transform.service';
import { TransformWorkspaceData, CdmFieldMapping, LegacyReport } from '../../core/models/models';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-transform-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './transform.component.html',
  styleUrls: ['./transform.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransformComponent implements OnInit {
  reports: LegacyReport[] = [];
  selectedReportId = 'REP-10492';
  workspaceData: TransformWorkspaceData | null = null;
  loading = false;
  saveMessage = '';

  constructor(
    private transformService: TransformService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.transformService.getReportCatalog().subscribe(reps => {
      this.reports = reps;
      this.loadWorkspace(this.selectedReportId);
    });
  }

  loadWorkspace(reportId: string): void {
    this.loading = true;
    this.saveMessage = '';
    this.selectedReportId = reportId;

    this.transformService.getTransformWorkspace(reportId).subscribe(data => {
      this.workspaceData = data;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  onReportChange(): void {
    this.loadWorkspace(this.selectedReportId);
  }

  onSaveMappings(): void {
    if (!this.workspaceData) return;
    this.transformService.saveCdmMappings(this.selectedReportId, this.workspaceData.mappings).subscribe(res => {
      this.saveMessage = res.message;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.saveMessage = '';
        this.cdr.markForCheck();
      }, 4000);
    });
  }

  verifyMapping(mapping: CdmFieldMapping): void {
    mapping.status = 'VERIFIED';
    this.cdr.markForCheck();
  }
}
