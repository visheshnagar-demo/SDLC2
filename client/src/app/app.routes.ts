import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'reports/cash-statements',
    pathMatch: 'full'
  },
  {
    path: 'reports/cash-statements',
    loadComponent: () =>
      import('./features/cash-reports/pages/cash-statements-landing/cash-statements-landing.component').then(
        (m) => m.CashStatementsLandingComponent
      )
  },
  {
    path: 'reports/criteria',
    loadComponent: () =>
      import('./features/cash-reports/pages/report-criteria/report-criteria.component').then(
        (m) => m.ReportCriteriaComponent
      )
  },
  {
    path: 'reports/criteria/:id',
    loadComponent: () =>
      import('./features/cash-reports/pages/report-criteria/report-criteria.component').then(
        (m) => m.ReportCriteriaComponent
      )
  },
  {
    path: 'reports/my-reports',
    loadComponent: () =>
      import('./features/reports/pages/my-reports/my-reports.component').then(
        (m) => m.MyReportsComponent
      )
  },
  {
    path: 'library/delivery-options',
    loadComponent: () =>
      import('./features/library/pages/delivery-options-maintenance/delivery-options-maintenance.component').then(
        (m) => m.DeliveryOptionsMaintenanceComponent
      )
  },
  {
    path: 'scheduling',
    loadComponent: () =>
      import('./features/scheduling/pages/schedule-management/schedule-management.component').then(
        (m) => m.ScheduleManagementComponent
      )
  },
  {
    path: '**',
    redirectTo: 'reports/cash-statements'
  }
];
