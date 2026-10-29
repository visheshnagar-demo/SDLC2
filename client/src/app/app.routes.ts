import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'govern',
    pathMatch: 'full'
  },
  {
    path: 'govern',
    loadComponent: () =>
      import('./features/govern/govern.component').then(m => m.GovernComponent),
    title: 'Govern & Progress Dashboard | CitiDirect Migration'
  },
  {
    path: 'discover',
    loadComponent: () =>
      import('./features/discover/discover.component').then(m => m.DiscoverComponent),
    title: 'Discover Legacy Reports | CitiDirect Migration'
  },
  {
    path: 'transform',
    loadComponent: () =>
      import('./features/transform/transform.component').then(m => m.TransformComponent),
    title: 'Transform & CDM Mapping | CitiDirect Migration'
  },
  {
    path: 'validate',
    loadComponent: () =>
      import('./features/validate/validate.component').then(m => m.ValidateComponent),
    title: 'Validate & Gate Checks | CitiDirect Migration'
  },
  {
    path: 'migrate',
    loadComponent: () =>
      import('./features/migrate/migrate.component').then(m => m.MigrateComponent),
    title: 'Migrate & Execution Queue | CitiDirect Migration'
  },
  {
    path: '**',
    redirectTo: 'govern'
  }
];
