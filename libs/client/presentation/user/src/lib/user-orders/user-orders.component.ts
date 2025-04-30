import { Component, OnInit } from '@angular/core';
import { IOrderEntity } from '@paris-2024/shared-interfaces';
import { OrderService } from '@paris-2024/client-data-access-order';
import { Router } from '@angular/router';
import { FormatPricePipe } from '@paris-2024/client-utils';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'lib-user-orders',
  standalone: true,
  imports: [
    FormatPricePipe,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.scss',
})
export class UserOrdersComponent implements OnInit {
  orders: Array<IOrderEntity>;
  constructor(
    private orderService: OrderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.orderService.findUserOrders()
      .subscribe((orders) => this.orders = orders 
    );
  }

  goToDetails(id: IOrderEntity['id']) {
    this.router.navigate([`/shop/order/${id}`])
  }
}
