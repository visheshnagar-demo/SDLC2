import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pending-ribbon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-ribbon.component.html',
  styleUrl: './pending-ribbon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingRibbonComponent {
  @Input() pendingCount: number | null = 3;
  @Input() cutOffTime: string = '17:00 EST (-01:42:15)';
  @Output() reviewClicked = new EventEmitter<void>();
  @Output() dismissClicked = new EventEmitter<void>();

  isDismissed = false;

  dismiss(): void {
    this.isDismissed = true;
    this.dismissClicked.emit();
  }

  review(): void {
    this.reviewClicked.emit();
  }
}
