import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StripeService } from 'ngx-stripe';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { Order, OrderService } from '@paris-2024/client-data-access-order';
import { PaymentIntentResult } from '@stripe/stripe-js';
import { PlatformService } from '@paris-2024/client-utils';
import { PaymentComponent } from './payment.component';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  let stripeService: jest.Mocked<StripeService>;
  let apiRequest: jest.Mocked<ApiRequestService>;
  let orderService: jest.Mocked<OrderService>;
  let router: jest.Mocked<Router>;
  let platformService: { isBrowser: boolean };
  let card: { update: jest.Mock; mount: jest.Mock };
  let elements: { create: jest.Mock };

  const createComponent = () => {
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('amount', 4200);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    platformService = { isBrowser: true };
    card = { update: jest.fn(), mount: jest.fn() };
    elements = { create: jest.fn().mockReturnValue(card) };

    stripeService = {
      elements: jest.fn().mockReturnValue(of(elements)),
      confirmCardPayment: jest.fn(),
    } as unknown as jest.Mocked<StripeService>;

    apiRequest = {
      post: jest.fn(),
    } as unknown as jest.Mocked<ApiRequestService>;

    orderService = {
      newOrder: jest.fn(),
    } as unknown as jest.Mocked<OrderService>;

    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [PaymentComponent],
      providers: [
        { provide: StripeService, useValue: stripeService },
        { provide: ApiRequestService, useValue: apiRequest },
        { provide: OrderService, useValue: orderService },
        { provide: PlatformService, useValue: platformService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('card element', () => {
    it('should mount the Stripe card element in the browser', () => {
      createComponent();

      expect(elements.create).toHaveBeenCalledWith('card', expect.any(Object));
      expect(card.update).toHaveBeenCalledWith({ hidePostalCode: true });
      expect(card.mount).toHaveBeenCalledWith('#card-element');
      expect(component.card).toBe(card);
    });

    it('should not load Stripe on the server', () => {
      platformService.isBrowser = false;
      createComponent();

      expect(stripeService.elements).not.toHaveBeenCalled();
    });
  });

  describe('createPaymentIntent', () => {
    beforeEach(() => createComponent());

    it('should request a payment intent in euros then confirm the payment', () => {
      apiRequest.post.mockReturnValue(of({ clientSecret: 'secret_123' }));
      const confirmSpy = jest.spyOn(component, 'confirmPayment').mockImplementation(() => undefined);

      component.createPaymentIntent(4200);

      expect(apiRequest.post).toHaveBeenCalledWith('/stripe/create-payment-intent', {
        amount: 4200,
        currencyCode: 'eur',
      });
      expect(component.paymentIntent).toBe('secret_123');
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should show an error and not confirm when the API returns nothing', () => {
      apiRequest.post.mockReturnValue(of(null));
      const confirmSpy = jest.spyOn(component, 'confirmPayment');

      component.createPaymentIntent(4200);

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(component.error).toBe('Failed to create payment intent. Please try again.');
    });

    it('should show an error when the request errors', () => {
      apiRequest.post.mockReturnValue(throwError(() => new Error('network')));

      component.createPaymentIntent(4200);

      expect(component.error).toBe('Failed to create payment intent. Please try again.');
    });

    it('should be triggered by the pay button with the amount', () => {
      apiRequest.post.mockReturnValue(of(null));

      fixture.nativeElement.querySelector('button').click();

      expect(apiRequest.post).toHaveBeenCalledWith(
        '/stripe/create-payment-intent',
        expect.objectContaining({ amount: 4200 })
      );
    });
  });

  describe('confirmPayment', () => {
    beforeEach(() => {
      createComponent();
      component.paymentIntent = 'secret_123';
    });

    it('should do nothing without a payment intent', () => {
      component.paymentIntent = undefined;

      component.confirmPayment();

      expect(stripeService.confirmCardPayment).not.toHaveBeenCalled();
    });

    it('should complete the checkout when the payment succeeds', () => {
      stripeService.confirmCardPayment.mockReturnValue(
        of({ paymentIntent: { status: 'succeeded' } } as unknown as PaymentIntentResult)
      );
      const completeSpy = jest.spyOn(component, 'completeCheckout').mockImplementation(() => undefined);

      component.confirmPayment();

      expect(stripeService.confirmCardPayment).toHaveBeenCalledWith('secret_123', {
        payment_method: { card },
      });
      expect(completeSpy).toHaveBeenCalled();
      expect(component.error).toBeNull();
    });

    it('should show the Stripe error when the payment is declined', () => {
      stripeService.confirmCardPayment.mockReturnValue(
        of({ error: { message: 'Your card was declined.' } } as unknown as PaymentIntentResult)
      );
      const completeSpy = jest.spyOn(component, 'completeCheckout');

      component.confirmPayment();

      expect(completeSpy).not.toHaveBeenCalled();
      expect(component.error).toBe('Your card was declined.');
    });

    it('should not complete the checkout when the payment is not succeeded', () => {
      stripeService.confirmCardPayment.mockReturnValue(
        of({ paymentIntent: { status: 'requires_action' } } as unknown as PaymentIntentResult)
      );
      const completeSpy = jest.spyOn(component, 'completeCheckout');

      component.confirmPayment();

      expect(completeSpy).not.toHaveBeenCalled();
      expect(component.error).toBe('Payment failed. Please try again.');
    });

    it('should show the error message when Stripe errors', () => {
      stripeService.confirmCardPayment.mockReturnValue(throwError(() => new Error('Stripe down')));

      component.confirmPayment();

      expect(component.error).toBe('Stripe down');
    });
  });

  describe('completeCheckout', () => {
    beforeEach(() => createComponent());

    it('should create the order and go to the success page', () => {
      orderService.newOrder.mockReturnValue(of({ id: 'order-1' } as Order));

      component.completeCheckout();

      expect(router.navigate).toHaveBeenCalledWith(['/shop/order-success']);
    });

    it('should show an error and stay on the page when the order is not created', () => {
      orderService.newOrder.mockReturnValue(of(null as unknown as Order));

      component.completeCheckout();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.error).toBe('Failed to complete checkout. Please try again.');
    });
  });
});
