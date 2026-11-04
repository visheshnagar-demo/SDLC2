import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopNavBarComponent } from './components/top-nav-bar/top-nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopNavBarComponent],
  template: `
    <app-top-nav-bar></app-top-nav-bar>
    <main class="main-viewport">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-viewport {
      display: flex;
      flex-direction: column;
      flex: 1;
      background-color: #F6F8FA;
    }
  `]
})
export class AppComponent {
  title = 'citidirect-cash-statements';
}
