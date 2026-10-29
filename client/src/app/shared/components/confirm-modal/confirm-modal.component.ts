import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Human-in-the-Loop Approval Required';
  @Input() message = 'Are you sure you want to approve this migration job for final commit into CitiDirect?';
  @Input() confirmText = 'Approve & Commit';
  @Input() cancelText = 'Cancel';
  @Input() variant: 'primary' | 'danger' | 'warning' = 'primary';
  @Input() details: { label: string; value: string }[] = [];

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
