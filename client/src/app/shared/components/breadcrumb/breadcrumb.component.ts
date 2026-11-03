import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="citi-breadcrumb-bar">
      <div class="breadcrumb-trail">
        <a routerLink="/" class="crumb-link">CitiDirect</a>
        <span class="separator">&rsaquo;</span>
        <a routerLink="/reports" class="crumb-link">Reports &amp; Analytics</a>
        <span class="separator">&rsaquo;</span>
        <span class="current-crumb">{{ currentSection }}</span>
      </div>

      <div class="breadcrumb-actions">
        <button class="favorite-btn" title="Add to Quick Access Favorites">&#9734; Favorite</button>
        <span class="help-link">Help &amp; Documentation</span>
      </div>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citi-breadcrumb-bar {
      height: $citi-breadcrumb-height;
      background-color: #FFFFFF;
      border-bottom: 1px solid $citi-border-subtle;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font-size: 11px;
    }

    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 6px;

      .crumb-link {
        color: $citi-text-link-blue;
        text-decoration: none;
        font-weight: 600;

        &:hover {
          text-decoration: underline;
        }
      }

      .separator {
        color: $citi-text-secondary;
        font-size: 14px;
      }

      .current-crumb {
        color: $citi-text-primary;
        font-weight: 700;
      }
    }

    .breadcrumb-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .favorite-btn {
        background: none;
        border: 1px solid $citi-border-input;
        border-radius: 2px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        color: $citi-text-secondary;
        cursor: pointer;

        &:hover {
          background-color: $citi-surface-canvas;
          color: $citi-core-blue;
        }
      }

      .help-link {
        color: $citi-text-link-blue;
        cursor: pointer;
        text-decoration: underline;
      }
    }
  `]
})
export class BreadcrumbComponent {
  @Input() currentSection: string = 'Cash Statement Reports';
}
