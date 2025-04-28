import { Component } from '@angular/core';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-order-success',
  standalone: true,
  imports: [RouteButtonComponent],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss',
})
export class OrderSuccessComponent {}
