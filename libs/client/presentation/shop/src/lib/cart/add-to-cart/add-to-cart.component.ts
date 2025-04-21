import { Component, Input, OnDestroy } from '@angular/core';
import { GuestTokenService, SnackbarService } from '@paris-2024/client-utils';
import { Cart, CartDto, CartFormValue, CartService } from '@paris-2024/client-data-access-cart';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { filter, Subscription } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-add-to-cart',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
})
export class AddToCartComponent implements OnDestroy {
  subscription: Subscription = new Subscription;
  @Input({ required: true }) bundleId: string;
  quantityControl = new FormControl(1);
  readonly MIN_QUANTITY = 0;
  readonly MAX_QUANTITY = 10;

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
    const quantity = this.quantityControl.value ?? 0;
    
    let dto: CartDto = {
      quantity: quantity,
      bundleId: this.bundleId,
    };

    if (!this.authService.isAuth()) {
      const guestToken = this.guestTokenService.getOrCreateGuestToken();
      dto = { ... dto, guestToken: guestToken}
    }

    const cartDto = new CartDto(dto as CartFormValue);

    this.subscription = this.cartService.addToCart(cartDto)
      .pipe(filter(res => !!res))
      .subscribe((res: Cart) => {
        this.snackbarService.showSuccess('Produit ajouté au panier.');
      })
  }

  increaseQuantity(): void {
    const current = this.quantityControl.value || this.MIN_QUANTITY;
    if (current < this.MAX_QUANTITY) {
      this.quantityControl.setValue(current + 1);
    }
  }

  decreaseQuantity(): void {
    const current = this.quantityControl.value || this.MIN_QUANTITY;
    if (current > this.MIN_QUANTITY) {
      this.quantityControl.setValue(current - 1);
    }
  }

  isRemoveButton(): boolean {
    if(this.quantityControl.value && this.quantityControl.value > this.MIN_QUANTITY){
      return false;
    }
    return true;
  }

}
