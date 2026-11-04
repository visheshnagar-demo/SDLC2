import { Routes } from '@angular/router';
import { LandingGridComponent } from './pages/landing-grid/landing-grid.component';
import { CriteriaFormComponent } from './pages/criteria-form/criteria-form.component';
import { ScheduleBuilderComponent } from './pages/schedule-builder/schedule-builder.component';
import { AuthorizationQueueComponent } from './pages/authorization-queue/authorization-queue.component';

export const routes: Routes = [
  { path: '', component: LandingGridComponent, title: 'CitiDirect - Cash Statements' },
  { path: 'criteria', component: CriteriaFormComponent, title: 'CitiDirect - Criteria Search' },
  { path: 'schedules', component: ScheduleBuilderComponent, title: 'CitiDirect - Schedule Builder' },
  { path: 'authorizations', component: AuthorizationQueueComponent, title: 'CitiDirect - Maker Checker Authorization' },
  { path: '**', redirectTo: '' }
];
