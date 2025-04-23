import { Component, Input, OnDestroy } from '@angular/core';
import { GuestTokenService, SnackbarService } from '@paris-2024/client-utils';
import { Cart, CartDto, CartFormValue, CartService } from '@paris-2024/client-data-access-cart';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'lib-add-to-cart',
  standalone: true,
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
})
export class AddToCartComponent implements OnDestroy {
  subscription: Subscription = new Subscription;
  @Input({ required: true }) bundleId: string;

  constructor(
    private guestTokenService: GuestTokenService,
    private cartService: CartService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addToCart(): void {
    let dto: CartDto = {
      quantity: 1,
      bundleId: this.bundleId,
    };

    if (!this.authService.isAuth()) {
      const guestToken = this.guestTokenService.getOrCreateGuestToken();
      dto = { ...dto, guestToken: guestToken}
    }

    const cartDto = new CartDto(dto as CartFormValue);

    this.subscription = this.cartService.addToCart(cartDto)
      .pipe(filter(res => !!res))
      .subscribe((res: Cart) => {
        this.snackbarService.showSuccess('Produit ajouté au panier.');
      })
  }
}
