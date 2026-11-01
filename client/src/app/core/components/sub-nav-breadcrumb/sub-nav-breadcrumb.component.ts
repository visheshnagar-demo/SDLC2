import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-sub-nav-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sub-nav-breadcrumb.component.html',
  styleUrl: './sub-nav-breadcrumb.component.scss'
})
export class SubNavBreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateBreadcrumbs(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateBreadcrumbs(event.urlAfterRedirects || event.url);
      });
  }

  private updateBreadcrumbs(url: string): void {
    if (url.includes('criteria')) {
      this.breadcrumbs = [
        { label: 'Reports & Analytics', url: '/reports/cash-statements' },
        { label: 'Cash Reports', url: '/reports/cash-statements' },
        { label: 'Cash Statements Reports', url: '/reports/cash-statements' },
        { label: 'Report Criteria' }
      ];
    } else if (url.includes('delivery-options')) {
      this.breadcrumbs = [
        { label: 'Self Service', url: '/library/delivery-options' },
        { label: 'Maintenance', url: '/library/delivery-options' },
        { label: 'Library Maintenance', url: '/library/delivery-options' },
        { label: 'Delivery Options' }
      ];
    } else if (url.includes('scheduling')) {
      this.breadcrumbs = [
        { label: 'Reports & Analytics', url: '/reports/cash-statements' },
        { label: 'Schedule Reports', url: '/scheduling' },
        { label: 'Schedule Management & Maker-Checker' }
      ];
    } else if (url.includes('my-reports')) {
      this.breadcrumbs = [
        { label: 'Reports & Analytics', url: '/reports/cash-statements' },
        { label: 'Reports', url: '/reports/my-reports' },
        { label: 'My Reports' }
      ];
    } else {
      this.breadcrumbs = [
        { label: 'Reports & Analytics', url: '/reports/cash-statements' },
        { label: 'Cash Reports', url: '/reports/cash-statements' },
        { label: 'Cash Statements Reports' }
      ];
    }
  }
}
