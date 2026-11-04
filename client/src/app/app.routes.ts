import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'reports',
    pathMatch: 'full'
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/pages/reports-landing/reports-landing.component').then(m => m.ReportsLandingComponent)
  },
  {
    path: 'criteria',
    loadComponent: () => import('./features/reports/pages/criteria-form/criteria-form.component').then(m => m.CriteriaFormComponent)
  },
  {
    path: 'schedule',
    loadComponent: () => import('./features/reports/components/schedule-builder/schedule-builder.component').then(m => m.ScheduleBuilderComponent)
  },
  {
    path: 'delivery',
    loadComponent: () => import('./features/reports/components/delivery-manager/delivery-manager.component').then(m => m.DeliveryManagerComponent)
  },
  {
    path: '**',
    redirectTo: 'reports'
  }
];
