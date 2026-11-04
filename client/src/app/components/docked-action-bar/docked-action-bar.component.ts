import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-docked-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="docked-action-bar">
      <div class="action-left">
        <span class="selection-summary">{{ selectionText }}</span>
      </div>

      <div class="action-right">
        <ng-content></ng-content>
      </div>
    </footer>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .docked-action-bar {
      position: sticky;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      background-color: #E2ECF7;
      border-top: 1px solid $citi-border-grid;
      padding: 0 16px;
      box-shadow: 0 -2px 6px rgba(0, 45, 114, 0.1);
      z-index: 40;
    }

    .selection-summary {
      font-size: 11px;
      color: $citi-text-secondary;
      font-weight: 500;
    }

    .action-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  `]
})
export class DockedActionBarComponent {
  @Input() selectionText: string = '0 items selected';
}
