import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(@Inject('STRIPE_SECRET_KEY') private readonly secretKey: string) {
    this.stripe = new Stripe(this.secretKey, {
      apiVersion: '2026-09-30.endive',
      typescript: true
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Stripe.MetadataParam = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always'
        }
      });
      return { clientSecret: paymentIntent.client_secret };
    } catch {
      throw new Error('Error creating payment intent');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch {
      throw new Error('Error retrieving payment intent');
    }
  }

  async refund(paymentIntentId: string): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    } catch {
      throw new Error('Error refunding payment intent');
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
