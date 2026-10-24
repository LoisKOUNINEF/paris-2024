import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentComponent } from '@paris-2024/client-presentation-stripe';

@Component({
  selector: 'lib-checkout',
  imports: [PaymentComponent],
  templateUrl: './checkout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  totalPrice: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const total = params['total'];
      if (total) {
        this.totalPrice = parseInt(total);
      } else {
        this.router.navigate(['shop/cart']);
      }
    });
  }
}
