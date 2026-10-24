import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Cart, CartService } from '@paris-2024/client-data-access-cart';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { GuestTokenService } from '@paris-2024/client-utils';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { CartDetailsComponent } from './cart-details.component';

describe('CartDetailsComponent', () => {
  let component: CartDetailsComponent;
  let fixture: ComponentFixture<CartDetailsComponent>;
  let cartService: jest.Mocked<CartService>;
  let guestTokenService: jest.Mocked<GuestTokenService>;
  let router: jest.Mocked<Router>;
  const isAuth = signal(false);
  const statusChecked = signal(true);

  const bundle = (id: string, price: number, quantity: number) =>
    ({ id, name: `Bundle ${id}`, price, quantity }) as unknown as IItemJunctionModel;

  const makeCart = (bundles: IItemJunctionModel[]) => ({ bundles }) as unknown as Cart;

  const createComponent = (cart: Cart | null) => {
    cartService.findUserCart.mockReturnValue(of(cart as Cart));
    fixture = TestBed.createComponent(CartDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    isAuth.set(false);
    statusChecked.set(true);
    cartService = {
      findUserCart: jest.fn(),
    } as unknown as jest.Mocked<CartService>;

    guestTokenService = {
      getOrCreateGuestToken: jest.fn(),
      getGuestToken: jest.fn().mockReturnValue(null),
      clearGuestToken: jest.fn(),
    } as unknown as jest.Mocked<GuestTokenService>;

    router = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [CartDetailsComponent],
      providers: [
        { provide: CartService, useValue: cartService },
        { provide: GuestTokenService, useValue: guestTokenService },
        { provide: AuthService, useValue: { isAuth, statusChecked } },
        { provide: Router, useValue: router },
      ],
    })
    .overrideComponent(CartDetailsComponent, { set: { template: '' } })
    .compileComponents();
  });

  describe('initialisation', () => {
    it('should create a guest token for anonymous users', () => {
      createComponent(makeCart([]));

      expect(guestTokenService.getOrCreateGuestToken).toHaveBeenCalled();
    });

    it('should not create a guest token for logged in users', () => {
      isAuth.set(true);
      createComponent(makeCart([]));

      expect(guestTokenService.getOrCreateGuestToken).not.toHaveBeenCalled();
    });

    it('should load the cart', () => {
      const cart = makeCart([bundle('a', 1000, 1)]);
      createComponent(cart);

      expect(component.cart).toBe(cart);
    });

    it('should create the guest token before requesting the cart', () => {
      createComponent(makeCart([]));

      expect(guestTokenService.getOrCreateGuestToken.mock.invocationCallOrder[0])
        .toBeLessThan(cartService.findUserCart.mock.invocationCallOrder[0]);
    });

    it('should clear a stale guest token for logged in users', () => {
      isAuth.set(true);
      createComponent(makeCart([]));

      expect(guestTokenService.clearGuestToken).toHaveBeenCalled();
    });

    it('should wait for the auth status before deciding the user is a guest', () => {
      statusChecked.set(false);
      createComponent(makeCart([bundle('a', 1000, 1)]));

      expect(guestTokenService.getOrCreateGuestToken).not.toHaveBeenCalled();
      expect(cartService.findUserCart).not.toHaveBeenCalled();

      // the status check resolves: the user was logged in all along
      isAuth.set(true);
      statusChecked.set(true);
      fixture.detectChanges();

      expect(guestTokenService.getOrCreateGuestToken).not.toHaveBeenCalled();
      expect(cartService.findUserCart).toHaveBeenCalled();
      expect(component.cart.bundles).toHaveLength(1);
    });
  });

  describe('totalPrice', () => {
    it('should sum price × quantity of every bundle', () => {
      createComponent(makeCart([bundle('a', 1000, 2), bundle('b', 2550, 3)]));

      expect(component.totalPrice()).toBe(9650);
    });

    it('should be zero for an empty cart', () => {
      createComponent(makeCart([]));

      expect(component.totalPrice()).toBe(0);
    });
  });

  describe('checkoutDisabled', () => {
    it('should be disabled for an empty cart', () => {
      createComponent(makeCart([]));

      expect(component.checkoutDisabled()).toBe(true);
    });

    it('should be enabled when the cart has bundles', () => {
      createComponent(makeCart([bundle('a', 1000, 1)]));

      expect(component.checkoutDisabled()).toBe(false);
    });
  });

  describe('createOrder', () => {
    it('should send guests to the login page', () => {
      createComponent(makeCart([bundle('a', 1000, 1)]));

      component.createOrder();

      expect(router.navigate).toHaveBeenCalledWith(['auth/login']);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should send logged in users to checkout with the total', () => {
      isAuth.set(true);
      createComponent(makeCart([bundle('a', 1000, 2), bundle('b', 500, 1)]));

      component.createOrder();

      expect(router.navigate).toHaveBeenCalledWith(['shop/checkout'], {
        queryParams: { total: 2500 },
      });
    });

    it('should send logged in users to checkout even with a leftover guest token', () => {
      isAuth.set(true);
      guestTokenService.getGuestToken.mockReturnValue('stale-token');
      createComponent(makeCart([bundle('a', 1000, 1)]));

      component.createOrder();

      expect(router.navigate).toHaveBeenCalledWith(['shop/checkout'], {
        queryParams: { total: 1000 },
      });
    });
  });

  describe('onQuantityChange', () => {
    beforeEach(() => {
      createComponent(makeCart([bundle('a', 1000, 1), bundle('b', 500, 2)]));
    });

    it('should update the quantity of the bundle', () => {
      component.onQuantityChange('b', 4);

      expect(component.cart.bundles.find(b => b.id === 'b')?.quantity).toBe(4);
      expect(component.totalPrice()).toBe(3000);
    });

    it('should remove the bundle when the quantity is zero', () => {
      component.onQuantityChange('a', 0);

      expect(component.cart.bundles.map(b => b.id)).toEqual(['b']);
    });

    it('should ignore unknown bundles', () => {
      component.onQuantityChange('unknown', 0);

      expect(component.cart.bundles).toHaveLength(2);
    });
  });
});
