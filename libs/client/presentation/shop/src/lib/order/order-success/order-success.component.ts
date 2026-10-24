import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-order-success',
  imports: [RouteButtonComponent],
  templateUrl: './order-success.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './order-success.component.scss',
})
export class OrderSuccessComponent {}
