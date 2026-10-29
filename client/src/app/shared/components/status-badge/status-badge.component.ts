import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MigrationStatus } from '../../../core/models/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input() status: MigrationStatus | string | null = 'DISCOVERED';
  @Input() size: 'sm' | 'md' = 'md';

  getBadgeClass(): string {
    const s = (this.status || '').toUpperCase();
    switch (s) {
      case 'DISCOVERED':
        return 'badge-discovered';
      case 'TRANSFORMED':
        return 'badge-transformed';
      case 'VALIDATED':
      case 'HEALTHY':
      case 'APPROVED':
      case 'AUTO_APPROVED':
      case 'COMPLETED':
      case 'VERIFIED':
        return 'badge-validated';
      case 'MIGRATED':
        return 'badge-migrated';
      case 'IN_PROGRESS':
      case 'RUNNING':
        return 'badge-progress';
      case 'PENDING_APPROVAL':
      case 'MANUAL_REVIEW':
      case 'WARNING':
      case 'QUEUED':
      case 'SCHEDULED':
        return 'badge-warning';
      case 'FAILED':
      case 'REJECTED':
      case 'CRITICAL':
      case 'ERROR':
        return 'badge-failed';
      default:
        return 'badge-default';
    }
  }

  getDisplayLabel(): string {
    return (this.status || '').replace(/_/g, ' ');
  }
}
