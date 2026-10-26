import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Cart, CartService } from '@paris-2024/client-data-access-cart';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { GuestTokenService, SnackbarService } from '@paris-2024/client-utils';
import { AddToCartComponent } from './add-to-cart.component';

describe('AddToCartComponent', () => {
  let component: AddToCartComponent;
  let fixture: ComponentFixture<AddToCartComponent>;
  let cartService: jest.Mocked<CartService>;
  let guestTokenService: jest.Mocked<GuestTokenService>;
  let snackbarService: jest.Mocked<SnackbarService>;
  const isAuth = signal(false);

  beforeEach(async () => {
    isAuth.set(false);
    cartService = {
      addToCart: jest.fn().mockReturnValue(of({ bundles: [] } as unknown as Cart)),
    } as unknown as jest.Mocked<CartService>;

    guestTokenService = {
      getOrCreateGuestToken: jest.fn().mockReturnValue('guest-123'),
    } as unknown as jest.Mocked<GuestTokenService>;

    snackbarService = {
      showSuccess: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    await TestBed.configureTestingModule({
      imports: [AddToCartComponent],
      providers: [
        { provide: CartService, useValue: cartService },
        { provide: GuestTokenService, useValue: guestTokenService },
        { provide: SnackbarService, useValue: snackbarService },
        { provide: AuthService, useValue: { isAuth } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddToCartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bundleId', 'bundle-1');
    fixture.detectChanges();
  });

  it('should attach a guest token when the user is not logged in', () => {
    component.addToCart();

    expect(guestTokenService.getOrCreateGuestToken).toHaveBeenCalled();
    expect(cartService.addToCart).toHaveBeenCalledWith({
      quantity: 1,
      bundleId: 'bundle-1',
      guestToken: 'guest-123',
    });
  });

  it('should not attach a guest token when the user is logged in', () => {
    isAuth.set(true);

    component.addToCart();

    expect(guestTokenService.getOrCreateGuestToken).not.toHaveBeenCalled();
    expect(cartService.addToCart).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 1, bundleId: 'bundle-1', guestToken: undefined })
    );
  });

  it('should confirm when the bundle was added', () => {
    component.addToCart();

    expect(snackbarService.showSuccess).toHaveBeenCalledWith('Produit ajouté au panier.');
  });

  it('should not confirm when the API returns nothing', () => {
    cartService.addToCart.mockReturnValue(of(null as unknown as Cart));

    component.addToCart();

    expect(snackbarService.showSuccess).not.toHaveBeenCalled();
  });

  it('should add the bundle when the button is clicked', () => {
    fixture.nativeElement.querySelector('button').click();

    expect(cartService.addToCart).toHaveBeenCalled();
  });
});
