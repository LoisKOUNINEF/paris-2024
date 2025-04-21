import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { Cart, CartService } from '@paris-2024/client-data-access-cart';
import { OrderService } from '@paris-2024/client-data-access-order';
import { FormatPricePipe, GuestTokenService, SortArrayPipe } from '@paris-2024/client-utils';
import { Subscription } from 'rxjs';
import { AddToCartComponent } from '../add-to-cart/add-to-cart.component';
import { ICartBundles } from '@paris-2024/shared-interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-cart-details',
  standalone: true,
  imports: [
    CurrencyPipe, 
    FormatPricePipe, 
    SortArrayPipe,
    AddToCartComponent,
  ],
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.scss',
})
export class CartDetailsComponent implements OnInit, OnDestroy {
  cart!: Cart;
  initialSubscription: Subscription = new Subscription;
  updateSubscription: Subscription = new Subscription;
  removeSubscription: Subscription = new Subscription;
  subscriptions: Array<Subscription> = [];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private guestTokenService: GuestTokenService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuth()) {
      this.guestTokenService.getOrCreateGuestToken();
    }
    this.initialSubscription = this.cartService.findUserCart()
      .subscribe((cart: Cart) => {
        this.cart = cart;
    });
    this.subscriptions.push(this.initialSubscription);
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  totalPrice() {
    return this.cart.bundles.reduce((acc: any, bundle: ICartBundles) => {
      return (acc += (bundle.quantity * bundle.bundle.price));
    }, 0);
  }

  createOrder() { 
    if (this.guestTokenService.getGuestToken()) {
      this.router.navigate(['auth/login']);
    }
    this.orderService.newOrder().subscribe();
  }

  checkoutDisabled(): boolean {
    if (this.cart && this.cart.bundles.length === 1) {
      return true;
    }
    return false;
  }

}
