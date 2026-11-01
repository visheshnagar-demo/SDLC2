import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LookupService } from '../../services/lookup.service';
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
    id: 'USR-101',
    username: 'jjustin',
    fullName: 'JUSTIN,JOHN',
    role: 'MAKER',
    timeZone: 'GMT'
  };

  currentGmtTime = '';
  activeDropdown: string | null = null;

  constructor(private router: Router, private lookupService: LookupService) {}

  ngOnInit(): void {
    this.lookupService.getCurrentUser().subscribe(u => this.currentUser = u);
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
    this.currentUser.role = role;
    if (role === 'AUTHORIZER') {
      this.currentUser.fullName = 'SMITH,SARAH';
      this.currentUser.id = 'USR-202';
    } else {
      this.currentUser.fullName = 'JUSTIN,JOHN';
      this.currentUser.id = 'USR-101';
    }
  }
}
