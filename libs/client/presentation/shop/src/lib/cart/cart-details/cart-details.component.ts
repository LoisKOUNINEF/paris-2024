import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@paris-2024/client-data-access-auth';
import { Cart, CartService } from '@paris-2024/client-data-access-cart';
import { FormatPricePipe, GuestTokenService } from '@paris-2024/client-utils';
import { Subject, takeUntil } from 'rxjs';
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
export class CartDetailsComponent implements OnDestroy, OnInit, AfterViewInit {
  private destroy$ = new Subject<void>();
  cart: Cart;

  constructor(
    private cartService: CartService,
    private guestTokenService: GuestTokenService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuth()) {
      this.guestTokenService.getOrCreateGuestToken();
    }
  }

  ngAfterViewInit(): void {
    this.cartService.findUserCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart: Cart) => this.cart = cart);   
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
