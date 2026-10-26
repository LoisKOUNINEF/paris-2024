import { Logger } from '@nestjs/common';
import { StripeService } from './stripe.service';

const mockPaymentIntentsCreate = jest.fn();
const mockPaymentIntentsRetrieve = jest.fn();
const mockRefundsCreate = jest.fn();

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockPaymentIntentsCreate,
      retrieve: mockPaymentIntentsRetrieve,
    },
    refunds: { create: mockRefundsCreate },
  })),
}));

describe('StripeService', () => {
  let service: StripeService;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    service = new StripeService('sk_test_key');
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent and only return its client secret', async () => {
      mockPaymentIntentsCreate.mockResolvedValue({ id: 'pi_1', client_secret: 'pi_1_secret' });

      await expect(service.createPaymentIntent(4500, 'eur', { userId: 'user-1' }))
        .resolves.toEqual({ clientSecret: 'pi_1_secret' });
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
        amount: 4500,
        currency: 'eur',
        metadata: { userId: 'user-1' },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always',
        },
      });
    });

    it('should hide stripe error details', async () => {
      mockPaymentIntentsCreate.mockRejectedValue(new Error('Invalid API Key provided: sk_test_key'));

      await expect(service.createPaymentIntent(4500, 'eur')).rejects.toThrow(/^Error creating payment intent$/);
    });

    it('should log the original stripe error', async () => {
      const stripeError = new Error('amount_too_small');
      mockPaymentIntentsCreate.mockRejectedValue(stripeError);

      await expect(service.createPaymentIntent(10, 'eur')).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith('Error creating payment intent', stripeError);
    });
  });

  describe('retrievePaymentIntent', () => {
    it('should return the payment intent from stripe', async () => {
      const paymentIntent = { id: 'pi_1', status: 'succeeded' };
      mockPaymentIntentsRetrieve.mockResolvedValue(paymentIntent);

      await expect(service.retrievePaymentIntent('pi_1')).resolves.toBe(paymentIntent);
      expect(mockPaymentIntentsRetrieve).toHaveBeenCalledWith('pi_1');
    });

    it('should hide stripe error details', async () => {
      mockPaymentIntentsRetrieve.mockRejectedValue(new Error('No such payment_intent: pi_unknown'));

      await expect(service.retrievePaymentIntent('pi_unknown')).rejects.toThrow(/^Error retrieving payment intent$/);
    });
  });

  describe('refund', () => {
    it('should refund the whole payment intent', async () => {
      mockRefundsCreate.mockResolvedValue({ id: 're_1' });

      await expect(service.refund('pi_1')).resolves.toEqual({ id: 're_1' });
      expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: 'pi_1' });
    });

    it('should hide stripe error details', async () => {
      mockRefundsCreate.mockRejectedValue(new Error('charge_already_refunded'));

      await expect(service.refund('pi_1')).rejects.toThrow(/^Error refunding payment intent$/);
    });
  });
});
