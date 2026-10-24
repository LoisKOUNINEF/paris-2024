import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PaymentComponent } from '@paris-2024/client-presentation-stripe';

// the amount to pay is computed by the server from the cart, see PaymentComponent
@Component({
  selector: 'lib-checkout',
  imports: [PaymentComponent],
  templateUrl: './checkout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {}
