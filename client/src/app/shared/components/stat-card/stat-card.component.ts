import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number | null = '';
  @Input() subtitle = '';
  @Input() changeDelta = '';
  @Input() isPositiveChange = true;
  @Input() variant: 'default' | 'primary' | 'success' | 'warning' | 'error' = 'default';
  @Input() iconType: 'reports' | 'transform' | 'validate' | 'migrate' | 'exceptions' | 'velocity' = 'reports';
}
