import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { Cart, CartService } from '@paris-2024/client-data-access-cart';
import { FormatPricePipe, GuestTokenService } from '@paris-2024/client-utils';
import { filter, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ModifyQuantityComponent } from '../modify-quantity/modify-quantity.component';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { Router } from '@angular/router';
import { RouteButtonComponent } from '@paris-2024/client-ui-shared';

@Component({
  selector: 'lib-cart-details',
  imports: [
    CurrencyPipe, 
    FormatPricePipe, 
    ModifyQuantityComponent,
    RouteButtonComponent
  ],
  templateUrl: './cart-details.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cart-details.component.scss',
})
export class CartDetailsComponent implements OnDestroy, OnInit {
  private destroy$ = new Subject<void>();
  private statusChecked$: Observable<boolean>;
  cart: Cart;

  constructor(
    private cartService: CartService,
    private guestTokenService: GuestTokenService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.statusChecked$ = toObservable(this.authService.statusChecked);
  }

  ngOnInit(): void {
    // wait for the initial auth status check before treating the user as a guest
    this.statusChecked$
      .pipe(
        filter(Boolean),
        take(1),
        switchMap(() => {
          if (this.authService.isAuth()) {
            this.guestTokenService.clearGuestToken();
          } else {
            this.guestTokenService.getOrCreateGuestToken();
          }
          return this.cartService.findUserCart();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((cart: Cart) => {
        this.cart = cart;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  totalPrice() {
    return this.cart.bundles.reduce((acc: number, bundle: IItemJunctionModel) => {
      return acc + bundle.quantity * bundle.price;
    }, 0);
  }

  createOrder() { 
    if (!this.authService.isAuth()) {
      this.router.navigate(['auth/login']);
      return;
    }      
    // the amount to pay is computed by the server
    this.router.navigate(['shop/checkout']);
  }

  checkoutDisabled(): boolean {
    if (this.cart && this.cart.bundles.length < 1) {
      return true;
    }
    return false;
  }

  onQuantityChange(bundleId: string, newQuantity: number) {
    const index = this.cart.bundles.findIndex(b => b.id === bundleId);

    if (index !== -1) {
      if (newQuantity === 0) {
        this.cart.bundles.splice(index, 1);
        this.cart.bundles = [...this.cart.bundles];
      } else {
        this.cart.bundles[index].quantity = newQuantity;
      }
    }
    this.cdr.markForCheck();
  }


}
