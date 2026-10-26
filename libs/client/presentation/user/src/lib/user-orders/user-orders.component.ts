import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IOrderEntity } from '@paris-2024/shared-interfaces';
import { OrderService } from '@paris-2024/client-data-access-order';
import { Router } from '@angular/router';
import { FormatPricePipe, PlatformService } from '@paris-2024/client-utils';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'lib-user-orders',
  imports: [
    FormatPricePipe,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './user-orders.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-orders.component.scss',
})
export class UserOrdersComponent implements OnInit {
  orders: Array<IOrderEntity>;
  constructor(
    private orderService: OrderService,
    private router: Router,
    private platformService: PlatformService,
  ) {}

  ngOnInit(): void {
    // the server render has no session cookie
    if (!this.platformService.isBrowser) return;
    this.orderService.findUserOrders()
      .subscribe((orders) => this.orders = orders 
    );
  }

  goToDetails(id: IOrderEntity['id']) {
    this.router.navigate([`/shop/order/${id}`])
  }
}
