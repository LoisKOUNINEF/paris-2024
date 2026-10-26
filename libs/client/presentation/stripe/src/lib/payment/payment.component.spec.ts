import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StripeService } from 'ngx-stripe';
import { Order, OrderService } from '@paris-2024/client-data-access-order';
import { PaymentIntentResult } from '@stripe/stripe-js';
import { PlatformService } from '@paris-2024/client-utils';
import { PaymentComponent } from './payment.component';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;
  let stripeService: jest.Mocked<StripeService>;
  let orderService: jest.Mocked<OrderService>;
  let router: jest.Mocked<Router>;
  let platformService: { isBrowser: boolean };
  let card: { update: jest.Mock; mount: jest.Mock; destroy: jest.Mock };
  let elements: { create: jest.Mock };

  const createComponent = () => {
    fixture = TestBed.createComponent(PaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    platformService = { isBrowser: true };
    card = { update: jest.fn(), mount: jest.fn(), destroy: jest.fn() };
    elements = { create: jest.fn().mockReturnValue(card) };

    stripeService = {
      elements: jest.fn().mockReturnValue(of(elements)),
      confirmCardPayment: jest.fn(),
    } as unknown as jest.Mocked<StripeService>;

    orderService = {
      createPaymentIntent: jest.fn().mockReturnValue(of({ clientSecret: 'secret_123', amount: 4200 })),
      newOrder: jest.fn(),
    } as unknown as jest.Mocked<OrderService>;

    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [PaymentComponent],
      providers: [
        { provide: StripeService, useValue: stripeService },
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

    it('should not load Stripe nor create a payment intent on the server', () => {
      platformService.isBrowser = false;
      createComponent();

      expect(stripeService.elements).not.toHaveBeenCalled();
      expect(orderService.createPaymentIntent).not.toHaveBeenCalled();
    });
  });

  describe('createPaymentIntent', () => {
    it('should request a payment intent on load and display the server amount', () => {
      createComponent();

      expect(orderService.createPaymentIntent).toHaveBeenCalledWith();
      expect(component.clientSecret).toBe('secret_123');
      expect(component.amount).toBe(4200);
      expect(button().textContent).toContain('42');
      expect(button().disabled).toBe(false);
    });

    // ApiRequestService maps http errors (e.g. an empty cart) to null
    it('should show an error, keep the button disabled and go back to the cart without a payment intent', () => {
      orderService.createPaymentIntent.mockReturnValue(of(null as never));
      createComponent();

      expect(component.error).toBe('Failed to create payment intent. Please try again.');
      expect(button().disabled).toBe(true);
      expect(router.navigate).toHaveBeenCalledWith(['/shop/cart']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy the Stripe card element', () => {
      createComponent();

      fixture.destroy();

      expect(card.destroy).toHaveBeenCalled();
    });
  });

  describe('confirmPayment', () => {
    beforeEach(() => createComponent());

    it('should do nothing without a payment intent', () => {
      component.clientSecret = null;

      component.confirmPayment();

      expect(stripeService.confirmCardPayment).not.toHaveBeenCalled();
    });

    it('should do nothing before the card element is mounted', () => {
      component.card = undefined as never;

      component.confirmPayment();

      expect(stripeService.confirmCardPayment).not.toHaveBeenCalled();
    });

    it('should be triggered by the pay button', () => {
      stripeService.confirmCardPayment.mockReturnValue(
        of({ paymentIntent: { id: 'pi_1', status: 'succeeded' } } as unknown as PaymentIntentResult)
      );
      orderService.newOrder.mockReturnValue(of({ id: 'order-1' } as Order));

      button().click();

      expect(stripeService.confirmCardPayment).toHaveBeenCalledWith('secret_123', {
        payment_method: { card },
      });
    });

    it('should complete the checkout with the confirmed payment intent', () => {
      stripeService.confirmCardPayment.mockReturnValue(
        of({ paymentIntent: { id: 'pi_1', status: 'succeeded' } } as unknown as PaymentIntentResult)
      );
      const completeSpy = jest.spyOn(component, 'completeCheckout').mockImplementation(() => undefined);

      component.confirmPayment();

      expect(completeSpy).toHaveBeenCalledWith('pi_1');
      expect(component.error).toBeNull();
    });

    it('should not confirm twice while a payment is processing', () => {
      stripeService.confirmCardPayment.mockReturnValue(of() as never);

      component.confirmPayment();
      component.confirmPayment();

      expect(stripeService.confirmCardPayment).toHaveBeenCalledTimes(1);
    });

    it('should show the Stripe error when the payment is declined and allow a retry', () => {
      stripeService.confirmCardPayment.mockReturnValue(
        of({ error: { message: 'Your card was declined.' } } as unknown as PaymentIntentResult)
      );
      const completeSpy = jest.spyOn(component, 'completeCheckout');

      component.confirmPayment();

      expect(completeSpy).not.toHaveBeenCalled();
      expect(component.error).toBe('Your card was declined.');
      expect(component.isProcessing).toBe(false);
    });

    it('should not complete the checkout when the payment is not succeeded', () => {
      stripeService.confirmCardPayment.mockReturnValue(
        of({ paymentIntent: { id: 'pi_1', status: 'requires_action' } } as unknown as PaymentIntentResult)
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
      expect(component.isProcessing).toBe(false);
    });
  });

  describe('completeCheckout', () => {
    beforeEach(() => createComponent());

    it('should create the order from the payment intent and go to the success page', () => {
      orderService.newOrder.mockReturnValue(of({ id: 'order-1' } as Order));

      component.completeCheckout('pi_1');

      expect(orderService.newOrder).toHaveBeenCalledWith('pi_1');
      expect(router.navigate).toHaveBeenCalledWith(['/shop/order-success']);
    });

    it('should show an error and stay on the page when the order is not created', () => {
      orderService.newOrder.mockReturnValue(of(null as unknown as Order));

      component.completeCheckout('pi_1');

      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.error).toBe('Failed to complete checkout. Please try again.');
      expect(component.isProcessing).toBe(false);
    });
  });
});
