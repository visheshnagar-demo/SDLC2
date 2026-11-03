import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-ribbon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="citi-pending-ribbon-track">
      <div class="ribbon-tabs-container">
        <button 
          class="ribbon-tab" 
          [class.active]="selectedTab === 'all'" 
          (click)="selectTab('all')">
          <span class="tab-title">View All Items</span>
          <span class="tab-counter">{{ totalCount }}</span>
        </button>

        <button 
          class="ribbon-tab pending-highlight" 
          [class.active]="selectedTab === 'pending'" 
          (click)="selectTab('pending')">
          <span class="tab-title">To Authorize</span>
          <span class="tab-counter alert">{{ pendingCount }}</span>
        </button>

        <button 
          class="ribbon-tab" 
          [class.active]="selectedTab === 'rejected'" 
          (click)="selectTab('rejected')">
          <span class="tab-title">Rejected / Paused</span>
          <span class="tab-counter">{{ rejectedCount }}</span>
        </button>
      </div>

      <div class="ribbon-controls">
        <span class="ribbon-info">Dual-Control Checker Queue Active</span>
      </div>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citi-pending-ribbon-track {
      height: $citi-ribbon-height;
      background-color: $citi-track-blue;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .ribbon-tabs-container {
      display: flex;
      align-items: flex-end;
      height: 100%;
      gap: 4px;

      .ribbon-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 30px;
        padding: 0 12px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-bottom: none;
        border-radius: 3px 3px 0 0;
        color: #FFFFFF;
        font-family: $citi-font-family;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease-in-out;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        &.active {
          background: #FFFFFF;
          color: $citi-core-blue;
          border-color: #FFFFFF;
          font-weight: 700;
          box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.15);

          .tab-counter {
            background-color: $citi-core-blue;
            color: #FFFFFF;

            &.alert {
              background-color: $citi-required-asterisk;
            }
          }
        }

        .tab-counter {
          padding: 1px 6px;
          background: rgba(0, 0, 0, 0.3);
          color: #FFFFFF;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;

          &.alert {
            background-color: $citi-red-arc;
          }
        }
      }
    }

    .ribbon-controls {
      .ribbon-info {
        font-size: 11px;
        color: #E1ECF4;
        font-weight: 600;
      }
    }
  `]
})
export class PendingRibbonComponent {
  @Input() totalCount: number = 0;
  @Input() pendingCount: number = 0;
  @Input() rejectedCount: number = 0;
  @Input() selectedTab: string = 'pending';
  @Output() tabChanged = new EventEmitter<string>();

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.tabChanged.emit(tab);
  }
}
