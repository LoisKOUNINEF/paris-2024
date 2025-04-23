import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number; currencyCode: string }) {
    try {
      const { amount, currencyCode } = body;

      if (amount <= 0 || !currencyCode) {
        throw new HttpException('Invalid amount or currency', HttpStatus.BAD_REQUEST);
      }
      return await this.stripeService.createPaymentIntent(amount, currencyCode);
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw new HttpException('Error creating payment intent', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
