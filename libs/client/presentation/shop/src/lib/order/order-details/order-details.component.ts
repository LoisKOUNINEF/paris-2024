import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '@paris-2024/client-data-access-order';
import { FormatPricePipe, PlatformService } from '@paris-2024/client-utils';
import { IOrderTickets } from '@paris-2024/shared-interfaces';

@Component({
  selector: 'lib-order-details',
  standalone: true,
  imports: [
    FormatPricePipe,
    CurrencyPipe,
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent {
  orderTickets: IOrderTickets;
  constructor(
    protected orderService: OrderService,
    private route: ActivatedRoute,
    private platformService: PlatformService,
  ) {}

  ngOnInit(): void {
    if(this.platformService.isBrowser) {
      const orderId = this.route.snapshot.paramMap.get('id');
      if (orderId) {
        this.orderService.findOne(orderId).subscribe((order) => {
          this.orderTickets = order;
        })
      }
    }
  }
}
