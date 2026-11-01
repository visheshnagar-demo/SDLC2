import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/entitlement.models';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './top-nav-bar.component.html',
  styleUrl: './top-nav-bar.component.scss'
})
export class TopNavBarComponent implements OnInit {
  currentUser: UserProfile = {
    id: 'usr-001',
    username: 'maker_user',
    fullName: 'JUSTIN,JOHN',
    email: 'test@example.com',
    role: 'ROLE_MAKER',
    timeZone: 'GMT (UTC+0)'
  };

  currentGmtTime = '';
  activeDropdown: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  updateClock(): void {
    const now = new Date();
    this.currentGmtTime = now.toUTCString().replace('GMT', '').trim() + ' GMT';
  }

  toggleDropdown(menu: string): void {
    this.activeDropdown = this.activeDropdown === menu ? null : menu;
  }

  closeDropdowns(): void {
    this.activeDropdown = null;
  }

  switchRole(role: 'MAKER' | 'AUTHORIZER'): void {
    this.authService.switchRole(role).subscribe({
      next: () => {
        this.currentUser = this.authService.getCurrentUser();
      },
      error: () => {
        // Fallback update
        if (role === 'AUTHORIZER') {
          this.currentUser = {
            id: 'usr-002',
            username: 'checker_user',
            fullName: 'SMITH,SARAH',
            email: 'admin@example.com',
            role: 'ROLE_AUTHORIZER',
            timeZone: 'GMT (UTC+0)'
          };
        } else {
          this.currentUser = {
            id: 'usr-001',
            username: 'maker_user',
            fullName: 'JUSTIN,JOHN',
            email: 'test@example.com',
            role: 'ROLE_MAKER',
            timeZone: 'GMT (UTC+0)'
          };
        }
      }
    });
  }
}
