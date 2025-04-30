import { Component } from '@angular/core';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-dashboard',
  standalone: true,
  imports: [RouteButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
