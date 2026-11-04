import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-actions-ribbon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pending-ribbon">
      <div class="ribbon-tabs">
        <button
          type="button"
          class="ribbon-tab"
          [class.active]="activeTab === 'submit'"
          (click)="selectTab('submit')">
          <span class="tab-label">To Submit / Modify</span>
          <span class="tab-count">{{ submitCount }}</span>
        </button>

        <button
          type="button"
          class="ribbon-tab"
          [class.active]="activeTab === 'authorize'"
          (click)="selectTab('authorize')">
          <span class="tab-label">To Authorize (Dual-Control)</span>
          <span class="tab-count badge-warning">{{ authorizeCount }}</span>
        </button>
      </div>

      <div class="ribbon-governance-note">
        <span class="governance-icon">🛡️</span>
        <span>Maker-Checker Policy: Self-authorization is strictly prohibited.</span>
      </div>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .pending-ribbon {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      background-color: $citi-track-blue;
      padding: 0 16px;
      border-bottom: 1px solid #1E5080;
    }

    .ribbon-tabs {
      display: flex;
      height: 100%;
      align-items: flex-end;
      gap: 4px;
    }

    .ribbon-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 30px;
      padding: 0 14px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      color: #FFFFFF;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      &.active {
        background: #FFFFFF;
        color: $citi-blue;
        font-weight: 600;
        border-color: #FFFFFF;
      }
    }

    .tab-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background-color: $citi-blue;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;

      &.badge-warning {
        background-color: $citi-warning;
        color: #000000;
      }
    }

    .ribbon-governance-note {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #EBF3FB;
    }

    .governance-icon {
      font-size: 12px;
    }
  `]
})
export class PendingActionsRibbonComponent {
  @Input() activeTab: 'submit' | 'authorize' = 'submit';
  @Input() submitCount: number = 0;
  @Input() authorizeCount: number = 0;
  @Output() tabChange = new EventEmitter<'submit' | 'authorize'>();

  selectTab(tab: 'submit' | 'authorize') {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
