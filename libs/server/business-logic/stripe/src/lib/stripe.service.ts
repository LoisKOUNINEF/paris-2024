import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(@Inject('STRIPE_SECRET_KEY') private readonly secretKey: string) {
    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2025-03-31.basil',
      typescript: true
    });
  }

  async createPaymentIntent(amount: number, currency: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        }
      });
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      throw new Error('Error creating payment intent');
    }
  }

  async getProducts(): Promise<Array<Stripe.Product>> {
    const products = await this.stripe.products.list();
    return products.data;
  }

  async getCustomers() {
    const customers = await this.stripe.customers.list({});
    return customers.data;
  }
}
