import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-readiness-score',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './readiness-score.component.html',
  styleUrls: ['./readiness-score.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadinessScoreComponent {
  @Input() score: number | null = 0;
  @Input() size = 48; // Diameter in px
  @Input() strokeWidth = 4;

  get clampedScore(): number {
    return Math.min(100, Math.max(0, this.score ?? 0));
  }

  get radius(): number {
    return (this.size - this.strokeWidth * 2) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get strokeDashoffset(): number {
    return this.circumference - (this.clampedScore / 100) * this.circumference;
  }

  get scoreColor(): string {
    const s = this.clampedScore;
    if (s >= 90) return '#107C41'; // Green
    if (s >= 75) return '#0076D6'; // Blue
    if (s >= 50) return '#D83B01'; // Orange
    return '#C42B1C'; // Red
  }

  get grade(): string {
    const s = this.clampedScore;
    if (s >= 90) return 'A';
    if (s >= 75) return 'B';
    if (s >= 50) return 'C';
    return 'D';
  }
}
