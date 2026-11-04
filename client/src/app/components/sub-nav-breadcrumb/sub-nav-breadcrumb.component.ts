import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sub-nav-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sub-nav-bar">
      <div class="breadcrumb-container">
        <span class="breadcrumb-root">Cash Management</span>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">{{ currentTitle }}</span>
      </div>
      <div class="system-status">
        <span class="status-indicator"></span>
        <span class="status-text">System Status: Connected (PROD-US)</span>
        <span class="timestamp">{{ currentTimestamp }}</span>
      </div>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .sub-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 32px;
      background-color: $citi-blue;
      color: #FFFFFF;
      padding: 0 16px;
      font-size: 11px;
    }

    .breadcrumb-container {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .breadcrumb-root {
      color: #A8BBCF;
    }

    .breadcrumb-separator {
      color: #7B99B8;
      font-size: 10px;
    }

    .breadcrumb-current {
      font-weight: 600;
      color: #FFFFFF;
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #D9E2EA;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      background-color: #00E676;
      border-radius: 50%;
      box-shadow: 0 0 4px #00E676;
    }

    .timestamp {
      color: #A8BBCF;
      font-family: $font-family-mono;
    }
  `]
})
export class SubNavBreadcrumbComponent {
  @Input() currentTitle: string = 'Cash Statement Reports';
  currentTimestamp: string = new Date().toUTCString();
}
