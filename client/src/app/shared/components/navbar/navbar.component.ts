import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  activeNav = signal<string>('reports');
  activeMegaMenu = signal<string | null>(null);
  isProfileMenuOpen = signal<boolean>(false);
  pendingCount = signal<number>(3);

  toggleMegaMenu(menuName: string): void {
    if (this.activeMegaMenu() === menuName) {
      this.activeMegaMenu.set(null);
    } else {
      this.activeMegaMenu.set(menuName);
    }
  }

  closeMegaMenu(): void {
    this.activeMegaMenu.set(null);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(v => !v);
  }
}
