import { Component, AfterViewInit, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NgxStripeModule, StripeService, StripeInstance } from 'ngx-stripe';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { PlatformService } from '@paris-2024/client-utils';
import { StripeCardElement } from '@stripe/stripe-js';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '@paris-2024/client-data-access-order';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-payment',
  imports: [
    NgxStripeModule,
    FormatPricePipe,
    CurrencyPipe,
  ],
  templateUrl: './payment.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit, AfterViewInit {
  // amount and client secret come from the server, computed from the cart
  amount: number | null = null;
  clientSecret: string | null = null;
  isProcessing = false;
  stripe: StripeInstance;
  card: StripeCardElement;
  error: string | null = null;
  appearance = {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      fontFamily: 'Arial, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  }

  constructor(
    private stripeService: StripeService,
    private platformService: PlatformService,
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if(this.platformService.isBrowser) {
      this.createPaymentIntent();
    }
  }

  ngAfterViewInit(): void {
    if(this.platformService.isBrowser) {
      this.stripeService.elements({ appearance: this.appearance }).subscribe((elements) => {
        this.card = elements.create('card', {
          style: {
            base: {
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              fontSize: '20px',
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

  createPaymentIntent() {
    this.orderService.createPaymentIntent().subscribe({
      next: (response) => {
        if (!response?.clientSecret) {
          this.error = 'Failed to create payment intent. Please try again.';
          return;
        }
        this.clientSecret = response.clientSecret;
        this.amount = response.amount;
      },
      error: (err) => {
        console.error('Payment Intent Error:', err);
        this.error = 'Failed to create payment intent. Please try again.';
        // e.g. the cart is empty
        this.router.navigate(['/shop/cart']);
      }
    });
  }

  confirmPayment() {
    if (!this.clientSecret || this.isProcessing) return;
    this.isProcessing = true;
    this.error = null;
    this.stripeService
      .confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.card,
        },
      })
      .subscribe({
        next: (result) => {
          if (result.paymentIntent?.status === 'succeeded') {
            this.completeCheckout(result.paymentIntent.id);
          } else {
            this.isProcessing = false;
            this.error = result.error?.message ?? 'Payment failed. Please try again.';
          }
        },
        error: (error) => {
          this.isProcessing = false;
          this.error = error.message || 'Error during payment';
        }
      });
  }

  completeCheckout(paymentIntentId: string) {
    this.orderService.newOrder(paymentIntentId).subscribe({
      next: (order) => {
        if (!order) {
          this.isProcessing = false;
          this.error = 'Failed to complete checkout. Please try again.';
          return;
        }
        this.router.navigate(['/shop/order-success']);
      },
      error: (err) => {
        console.error('Checkout Error:', err);
        this.isProcessing = false;
        this.error = 'Failed to complete checkout. Please try again.';
      }
    });
  }
}
