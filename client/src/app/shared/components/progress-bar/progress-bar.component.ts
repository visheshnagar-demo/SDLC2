import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  @Input() percentage: number | null = 0;
  @Input() showLabel = true;
  @Input() height = 8;
  @Input() variant: 'primary' | 'success' | 'warning' | 'error' | 'auto' = 'auto';

  get clampedPercentage(): number {
    return Math.min(100, Math.max(0, this.percentage ?? 0));
  }

  get computedVariant(): string {
    if (this.variant !== 'auto') {
      return this.variant;
    }
    const val = this.clampedPercentage;
    if (val >= 80) return 'success';
    if (val >= 40) return 'primary';
    if (val >= 20) return 'warning';
    return 'error';
  }
}
