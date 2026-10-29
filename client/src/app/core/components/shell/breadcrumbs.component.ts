import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent {
  currentRoute$: Observable<string>;

  constructor(private router: Router) {
    this.currentRoute$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => event.urlAfterRedirects || event.url),
      startWith(this.router.url)
    );
  }

  getModuleTitle(url: string): string {
    if (url.includes('/discover')) return 'Discover Legacy Reports';
    if (url.includes('/transform')) return 'Transform & CDM Mapping';
    if (url.includes('/validate')) return 'Validate & Gate Checks';
    if (url.includes('/migrate')) return 'Migrate & Execution Queue';
    return 'Govern & Progress Dashboard';
  }

  getModuleDescription(url: string): string {
    if (url.includes('/discover')) return 'Inspect 200,000+ cataloged CitiVelocity reports, dependency chains, and readiness ratings.';
    if (url.includes('/transform')) return 'Review AI-generated TypeScript Common Data Model (CDM) schemas and AST mapping rules.';
    if (url.includes('/validate')) return 'Review 4-tier validation gates: schema conformance, business rules, dependencies, and payload previews.';
    if (url.includes('/migrate')) return 'Orchestrate batch migration jobs, inspect live AGUI execution streams, and enforce Human-in-the-Loop gates.';
    return 'Executive command center tracking enterprise migration progress, KPI counters, and operational health.';
  }
}
