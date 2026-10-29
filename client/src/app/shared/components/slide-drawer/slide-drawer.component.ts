import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slide-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slide-drawer.component.html',
  styleUrls: ['./slide-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideDrawerComponent {
  @Input() isOpen = false;
  @Input() title = 'Drawer Details';
  @Input() subtitle = '';
  @Input() width = '600px';

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
