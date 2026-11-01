import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavBarComponent } from './core/components/top-nav-bar/top-nav-bar.component';
import { SubNavBreadcrumbComponent } from './core/components/sub-nav-breadcrumb/sub-nav-breadcrumb.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopNavBarComponent, SubNavBreadcrumbComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'CitiDirect® - Cash Statement Reports';
}
