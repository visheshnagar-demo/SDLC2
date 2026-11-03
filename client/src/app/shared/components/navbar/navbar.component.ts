import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="citi-navbar">
      <div class="citi-navbar-left">
        <div class="citi-logo">
          <span class="citi-text">citi</span>
          <div class="citi-red-arc"></div>
        </div>
        <div class="citi-brand-separator"></div>
        <span class="citi-app-title">CitiDirect&reg; Online Banking</span>
      </div>

      <nav class="citi-nav-menu">
        <a routerLink="/reports" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
          Reports &amp; Analytics
        </a>
        <a routerLink="/reports/criteria" routerLinkActive="active" class="nav-item">
          Criteria Definition
        </a>
        <a routerLink="/reports/schedule" routerLinkActive="active" class="nav-item">
          Schedule Builder
        </a>
        <a routerLink="/reports/delivery" routerLinkActive="active" class="nav-item">
          Delivery Options
        </a>
        <a routerLink="/reports/maker-checker" routerLinkActive="active" class="nav-item">
          Maker-Checker
          <span class="nav-badge">2</span>
        </a>
      </nav>

      <div class="citi-navbar-right">
        <div class="user-profile">
          <span class="user-role-badge">MAKER / CHECKER</span>
          <span class="user-name">V. NAGAR (CORP-OPS)</span>
          <span class="timestamp">01-APR-2026 09:30 UTC</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citi-navbar {
      height: $citi-navbar-height;
      background-color: $citi-dark-midnight;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      border-bottom: 2px solid $citi-cyan-accent;
      color: #FFFFFF;
      user-select: none;
    }

    .citi-navbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .citi-logo {
      position: relative;
      font-size: 24px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -1px;
      line-height: 1;

      .citi-red-arc {
        position: absolute;
        top: -6px;
        right: 4px;
        width: 14px;
        height: 6px;
        border-top: 3px solid $citi-red-arc;
        border-radius: 50% 50% 0 0;
      }
    }

    .citi-brand-separator {
      width: 1px;
      height: 20px;
      background-color: rgba(255, 255, 255, 0.25);
    }

    .citi-app-title {
      font-size: 13px;
      font-weight: 600;
      color: #D9E2EA;
      letter-spacing: 0.5px;
    }

    .citi-nav-menu {
      display: flex;
      height: 100%;
      align-items: center;
      gap: 4px;

      .nav-item {
        display: flex;
        align-items: center;
        height: $citi-navbar-height;
        padding: 0 16px;
        color: #C8D5E1;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        position: relative;
        transition: all 0.15s ease-in-out;

        &:hover {
          color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.08);
        }

        &.active {
          color: #FFFFFF;
          background-color: rgba(23, 147, 207, 0.15);

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background-color: $citi-cyan-accent;
          }
        }

        .nav-badge {
          margin-left: 6px;
          padding: 1px 6px;
          font-size: 10px;
          font-weight: 700;
          background-color: $citi-red-arc;
          color: #FFFFFF;
          border-radius: 10px;
        }
      }
    }

    .citi-navbar-right {
      display: flex;
      align-items: center;

      .user-profile {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;

        .user-role-badge {
          font-size: 9px;
          font-weight: 700;
          background-color: rgba(23, 147, 207, 0.3);
          color: $citi-sky-action-top;
          padding: 1px 5px;
          border-radius: 2px;
          letter-spacing: 0.5px;
        }

        .user-name {
          font-size: 12px;
          font-weight: 600;
          color: #FFFFFF;
        }

        .timestamp {
          font-size: 10px;
          color: #8CA3BA;
          font-family: $citi-font-mono;
        }
      }
    }
  `]
})
export class NavbarComponent {}
