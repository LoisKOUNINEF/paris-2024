import { Injectable } from '@angular/core';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { Observable } from 'rxjs';
import { Order } from './order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly orderUrl: string = '/orders';

  constructor(private apiRequestService: ApiRequestService) { }

  findAll(): Observable<Array<Order>> {
    return this.apiRequestService.get<Array<Order>>(this.orderUrl);
  }

  findUserOrders(): Observable<Array<Order>> {
    return this.apiRequestService.get<Array<Order>>(`${this.orderUrl}/user-order`);
  }

  findOne(orderId: Order['id']) {
    return this.apiRequestService.get<Order>(`${this.orderUrl}/${orderId}`);
  }

  newOrder() {
    return this.apiRequestService.post<Order>(this.orderUrl);
  }
}
