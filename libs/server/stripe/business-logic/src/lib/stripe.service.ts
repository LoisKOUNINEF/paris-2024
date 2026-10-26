import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
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
    } catch (error) {
      // stripe details stay out of the response but are needed to diagnose the failure
      this.logger.error('Error creating payment intent', error);
      throw new InternalServerErrorException('Error creating payment intent', { cause: error });
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Error retrieving payment intent ${paymentIntentId}`, error);
      throw new InternalServerErrorException('Error retrieving payment intent', { cause: error });
    }
  }

  async refund(paymentIntentId: string): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    } catch (error) {
      this.logger.error(`Error refunding payment intent ${paymentIntentId}`, error);
      throw new InternalServerErrorException('Error refunding payment intent', { cause: error });
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
