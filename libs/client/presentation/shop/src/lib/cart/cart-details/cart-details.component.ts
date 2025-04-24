import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { Cart, CartService } from '@paris-2024/client-data-access-cart';
import { FormatPricePipe, GuestTokenService } from '@paris-2024/client-utils';
import { Subscription } from 'rxjs';
import { ModifyQuantityComponent } from '../modify-quantity/modify-quantity.component';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { Router } from '@angular/router';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-cart-details',
  standalone: true,
  imports: [
    CurrencyPipe, 
    FormatPricePipe, 
    ModifyQuantityComponent,
    RouteButtonComponent
  ],
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.scss',
})
export class CartDetailsComponent implements AfterViewInit, OnDestroy {
  cart: Cart;
  initialSubscription: Subscription = new Subscription;
  updateSubscription: Subscription = new Subscription;
  removeSubscription: Subscription = new Subscription;
  subscriptions: Array<Subscription> = [];

  constructor(
    private cartService: CartService,
    private guestTokenService: GuestTokenService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    if (!this.authService.isAuth()) {
      this.guestTokenService.getOrCreateGuestToken();
    }
    this.cartService.findUserCart()
      .subscribe((cart: Cart) => {
        this.cart = cart;
    });
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  totalPrice() {
    return this.cart.bundles.reduce((acc: number, bundle: IItemJunctionModel) => {
      return (acc += (bundle.quantity * bundle.price));
    }, 0);
  }

  createOrder() { 
    if (this.guestTokenService.getGuestToken()) {
      this.router.navigate(['auth/login']);
      return;
    }      
    const totalPrice = this.totalPrice();
    this.router.navigate(['shop/checkout'], {
      queryParams: { total: totalPrice }
    })
  }

  checkoutDisabled(): boolean {
    if (this.cart && this.cart.bundles.length < 1) {
      return true;
    }
    return false;
  }

}
