import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { MegaMenuComponent } from './shared/components/mega-menu/mega-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, MegaMenuComponent],
  template: `
    <div class="citidirect-shell">
      <app-navbar></app-navbar>
      
      <div class="citi-subnav-stripe">
        <div class="subnav-left">
          <app-mega-menu></app-mega-menu>
          <span class="subnav-separator">|</span>
          <span class="subnav-active-mod">Cash Management &amp; Global Treasury &gt; Cash Statement Reports</span>
        </div>
        <div class="subnav-right">
          <span class="system-status"><span class="status-dot"></span> System Live (NY-DC-01)</span>
        </div>
      </div>

      <main class="citi-main-viewport">
        <router-outlet></router-outlet>
      </main>

      <footer class="citi-footer">
        <div class="footer-left">
          <span>&copy; 2026 Citigroup Inc. CitiDirect&reg; Online Banking. All rights reserved.</span>
        </div>
        <div class="footer-right">
          <span>Security &amp; Dual-Control Level 4 | Strict Compliance Mode</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @import 'styles/design-tokens';

    .citidirect-shell {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: $citi-surface-canvas;
    }

    .citi-subnav-stripe {
      height: 36px;
      background-color: $citi-brand-midnight;
      border-bottom: 1px solid $citi-border-grid;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      color: #FFFFFF;

      .subnav-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .subnav-separator {
          color: rgba(255, 255, 255, 0.3);
        }

        .subnav-active-mod {
          font-size: 11px;
          color: #D9E2EA;
          font-weight: 600;
        }
      }

      .subnav-right {
        .system-status {
          font-size: 11px;
          color: $citi-sky-action-top;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;

          .status-dot {
            width: 7px;
            height: 7px;
            background-color: #00E676;
            border-radius: 50%;
            box-shadow: 0 0 6px #00E676;
          }
        }
      }
    }

    .citi-main-viewport {
      flex: 1;
    }

    .citi-footer {
      height: 32px;
      background-color: #FFFFFF;
      border-top: 1px solid $citi-border-subtle;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font-size: 11px;
      color: $citi-text-secondary;
    }
  `]
})
export class AppComponent {}
