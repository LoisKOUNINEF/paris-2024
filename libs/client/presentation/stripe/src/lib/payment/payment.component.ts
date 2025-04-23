import { Component, Input, AfterViewInit } from '@angular/core';
import { NgxStripeModule, StripeService, StripeInstance } from 'ngx-stripe';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { PlatformService } from '@paris-2024/client-utils';
import { StripeCardElement } from '@stripe/stripe-js';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '@paris-2024/client-data-access-order';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-payment',
  standalone: true,
  imports: [
    NgxStripeModule,
    FormatPricePipe,
    CurrencyPipe,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements AfterViewInit {
  @Input({ required: true }) amount = 0;
  stripe: StripeInstance;
  card: StripeCardElement;
  paymentIntent: any;
  error: string | null = null;
  private readonly _stripeEndpoint = '/stripe/create-payment-intent'

  constructor(
    private stripeService: StripeService,
    private apiRequest: ApiRequestService,
    private platformService: PlatformService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    if(this.platformService.isBrowser) {
      this.stripeService.elements().subscribe((elements) => {
        this.card = elements.create('card', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '1.3em',
              lineHeight: '1.5em',
              padding: '2em',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a'
            }
          },
        });
        this.card.update({
          hidePostalCode: true,
        })
        this.card.mount('#card-element');
      });
    }
  }

  createPaymentIntent(amount: number) {
    const body = { amount, currencyCode: 'eur'};
    this.apiRequest
      .post<{ clientSecret: string }>(this._stripeEndpoint, body)
      .subscribe({
        next: (response) => {
          this.paymentIntent = response.clientSecret;
          // setTimeout(() => {
            this.confirmPayment();
          // }, 500);
        },
        error: (err) => {
          console.error('Payment Intent Error:', err);
          this.error = 'Failed to create payment intent. Please try again.';
        }
      });
  }

  confirmPayment() {
    console.debug('confirmPayment init')
    if (!this.paymentIntent) return;
    console.debug(`Card: ${this.card}`)
    console.debug(`PaymenIntent: ${this.paymentIntent}`)
    this.stripeService
      .confirmCardPayment(this.paymentIntent, {
        payment_method: {
          card: this.card,
        },
      })
      .subscribe({
        next: (result) => {
          if (result.paymentIntent?.status === 'succeeded') {
            console.debug('Payment successful');
            this.completeCheckout();
          } else {
            this.error = `Payment failed: ${result.paymentIntent}.`;
          }
        },
        error: (error) => {
          this.error = error.message || 'Error during payment';
        }
      });
  }

  completeCheckout() {
    this.orderService.newOrder().subscribe({
      next: () => this.router.navigate(['shop/order-success']),
      error: (err) => {
        console.error('Checkout Error:', err);
        this.error = 'Failed to complete checkout. Please try again.';
      }
    });
  }
}
