import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="top-nav-header">
      <div class="nav-left">
        <div class="citi-logo-container">
          <span class="citi-logo-text">citi</span>
          <div class="citi-red-arc"></div>
        </div>
        <span class="portal-title">CitiDirect<sup>®</sup> Online Banking</span>
        <nav class="main-menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">Cash Statements</a>
          <a routerLink="/criteria" routerLinkActive="active" class="nav-item">Criteria Search</a>
          <a routerLink="/schedules" routerLinkActive="active" class="nav-item">Schedule Builder</a>
          <a routerLink="/authorizations" routerLinkActive="active" class="nav-item">Authorizations</a>
        </nav>
      </div>

      <div class="nav-right">
        <div class="role-selector">
          <span class="role-label">Role:</span>
          <button
            class="role-badge"
            [class.active]="currentRole() === 'MAKER'"
            (click)="setRole('MAKER')">
            Maker
          </button>
          <button
            class="role-badge"
            [class.active]="currentRole() === 'CHECKER'"
            (click)="setRole('CHECKER')">
            Checker
          </button>
        </div>
        <div class="user-profile">
          <span class="user-name">{{ currentRole() === 'CHECKER' ? 'Checker User (usr_checker_202)' : 'Maker User (usr_maker_101)' }}</span>
          <span class="entity-badge">CITI-US-TREASURY</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .top-nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 52px;
      background-color: $citi-blue-dark;
      color: #FFFFFF;
      padding: 0 16px;
      border-bottom: 2px solid $citi-blue;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 100;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .citi-logo-container {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .citi-logo-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -1px;
      color: #FFFFFF;
    }

    .citi-red-arc {
      position: absolute;
      top: -2px;
      left: 14px;
      width: 18px;
      height: 10px;
      border-top: 3px solid $citi-red;
      border-radius: 12px 12px 0 0;
    }

    .portal-title {
      font-size: 13px;
      font-weight: 600;
      color: #D9E2EA;
      padding-right: 12px;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }

    .main-menu {
      display: flex;
      gap: 4px;
    }

    .nav-item {
      color: #D9E2EA;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      padding: 16px 12px;
      transition: all 0.15s ease;
      position: relative;

      &:hover {
        color: #FFFFFF;
        background-color: rgba(255, 255, 255, 0.05);
      }

      &.active {
        color: #FFFFFF;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: $citi-cyan-accent;
        }
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .role-selector {
      display: flex;
      align-items: center;
      gap: 6px;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .role-label {
      font-size: 11px;
      color: #A8BBCF;
    }

    .role-badge {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #FFFFFF;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 2px;
      cursor: pointer;

      &.active {
        background-color: $citi-cyan-accent;
        border-color: $citi-cyan-accent;
        font-weight: 600;
      }
    }

    .user-profile {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 11px;
    }

    .user-name {
      font-weight: 600;
      color: #FFFFFF;
    }

    .entity-badge {
      color: #A8BBCF;
      font-size: 10px;
    }
  `]
})
export class TopNavBarComponent {
  currentRole = signal<string>(localStorage.getItem('citi_user_role') || 'MAKER');

  setRole(role: string) {
    this.currentRole.set(role);
    localStorage.setItem('citi_user_role', role);
    window.location.reload();
  }
}
