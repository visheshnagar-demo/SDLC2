import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="citi-mega-menu-trigger" (click)="toggleMenu()">
      <button class="menu-btn">
        <span class="hamburger-icon">☰</span>
        <span>Navigation Menu</span>
      </button>

      @if (isOpen()) {
        <div class="mega-menu-dropdown" (click)="$event.stopPropagation()">
          <div class="menu-column">
            <h4>Reports &amp; Analytics</h4>
            <ul>
              <li><a routerLink="/reports" (click)="closeMenu()">Cash Statement Reports</a></li>
              <li><a routerLink="/reports/criteria" (click)="closeMenu()">Account Statement Criteria</a></li>
              <li><a routerLink="/reports/schedule" (click)="closeMenu()">Schedule Builder &amp; Recurrence</a></li>
              <li><a (click)="closeMenu()">Intra-Day Liquidity Monitor</a></li>
              <li><a (click)="closeMenu()">EOD Cash Consolidation</a></li>
            </ul>
          </div>

          <div class="menu-column">
            <h4>Self Service</h4>
            <ul>
              <li><a routerLink="/reports/delivery" (click)="closeMenu()">Delivery Options Maintenance</a></li>
              <li><a (click)="closeMenu()">SFTP Certificate Manager</a></li>
              <li><a (click)="closeMenu()">Report Distribution Groups</a></li>
              <li><a (click)="closeMenu()">User Entitlements Matrix</a></li>
            </ul>
          </div>

          <div class="menu-column">
            <h4>Governance &amp; Dual-Control</h4>
            <ul>
              <li><a routerLink="/reports/maker-checker" (click)="closeMenu()">Schedule Authorization Queue</a></li>
              <li><a routerLink="/reports/maker-checker" (click)="closeMenu()">Delivery Option Approval</a></li>
              <li><a (click)="closeMenu()">Immutable Audit Trail Logs</a></li>
              <li><a (click)="closeMenu()">Dual-Control Delegation</a></li>
            </ul>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citi-mega-menu-trigger {
      position: relative;
      display: inline-block;

      .menu-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 28px;
        padding: 0 10px;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 2px;
        color: #FFFFFF;
        font-family: $citi-font-family;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .hamburger-icon {
          font-size: 14px;
        }
      }
    }

    .mega-menu-dropdown {
      position: absolute;
      top: 34px;
      left: 0;
      width: 680px;
      background: #FFFFFF;
      border: 1px solid $citi-border-grid;
      border-radius: 3px;
      box-shadow: 0 8px 24px rgba(13, 30, 59, 0.25);
      display: flex;
      padding: 16px;
      gap: 20px;
      z-index: 1000;

      .menu-column {
        flex: 1;

        h4 {
          font-size: 13px;
          font-weight: 700;
          color: $citi-core-blue;
          padding-bottom: 8px;
          border-bottom: 2px solid $citi-surface-table-head;
          margin-bottom: 10px;
        }

        ul {
          list-style: none;

          li {
            margin-bottom: 6px;

            a {
              display: block;
              padding: 4px 6px;
              color: $citi-text-primary;
              font-size: 12px;
              text-decoration: none;
              border-radius: 2px;
              cursor: pointer;

              &:hover {
                background-color: $citi-surface-banner;
                color: $citi-text-link-blue;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  `]
})
export class MegaMenuComponent {
  isOpen = signal(false);

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}
