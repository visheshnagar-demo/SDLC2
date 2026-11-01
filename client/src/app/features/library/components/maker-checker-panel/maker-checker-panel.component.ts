import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MakerCheckerActionRequest } from '../../../../core/models/delivery.models';
import { UserProfile } from '../../../../core/models/entitlement.models';

@Component({
  selector: 'app-maker-checker-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maker-checker-panel.component.html',
  styleUrl: './maker-checker-panel.component.scss'
})
export class MakerCheckerPanelComponent {
  @Input() itemType: 'DELIVERY_OPTION' | 'SCHEDULE' = 'DELIVERY_OPTION';
  @Input() itemData: any;
  @Input() currentUser!: UserProfile;
  @Output() actionTriggered = new EventEmitter<MakerCheckerActionRequest>();
  @Output() close = new EventEmitter<void>();

  authorizerComment = '';

  get isSelfApproval(): boolean {
    if (!this.currentUser || !this.itemData) return false;
    return this.currentUser.fullName === this.itemData.makerName ||
           this.currentUser.id === this.itemData.makerId;
  }

  get canAuthorize(): boolean {
    return !this.isSelfApproval && this.currentUser?.role === 'AUTHORIZER';
  }

  onAction(action: 'AUTHORIZE' | 'SEND_TO_REPAIR' | 'REJECT'): void {
    this.actionTriggered.emit({
      action,
      comment: this.authorizerComment
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
