import { Routes } from '@angular/router';
import { LandingGridComponent } from './features/reports/pages/landing-grid/landing-grid.component';
import { CriteriaFormComponent } from './features/reports/pages/criteria-form/criteria-form.component';
import { ScheduleBuilderComponent } from './features/reports/pages/schedule-builder/schedule-builder.component';
import { DeliveryOptionsComponent } from './features/reports/pages/delivery-options/delivery-options.component';
import { MakerCheckerComponent } from './features/reports/pages/maker-checker/maker-checker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'reports', pathMatch: 'full' },
  { path: 'reports', component: LandingGridComponent },
  { path: 'reports/criteria', component: CriteriaFormComponent },
  { path: 'reports/schedule', component: ScheduleBuilderComponent },
  { path: 'reports/delivery', component: DeliveryOptionsComponent },
  { path: 'reports/maker-checker', component: MakerCheckerComponent },
  { path: '**', redirectTo: 'reports' }
];
