import { Injectable } from '@angular/core';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { Observable } from 'rxjs';
import { Order } from './order.model';
import { IOrderEntity, IOrderTickets, IPaymentIntent } from '@paris-2024/shared-interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly orderUrl: string = '/orders';

  constructor(private apiRequestService: ApiRequestService) { }

  findAll(): Observable<Array<Order>> {
    return this.apiRequestService.get<Array<Order>>(this.orderUrl);
  }

  findUserOrders(): Observable<Array<IOrderEntity>> {
    return this.apiRequestService.get<Array<IOrderEntity>>(`${this.orderUrl}/user-orders`);
  }

  findOne(orderId: Order['id']): Observable<IOrderTickets> {
    return this.apiRequestService.get<IOrderTickets>(`${this.orderUrl}/${orderId}`);
  }

  // the amount is computed by the server from the cart
  createPaymentIntent(): Observable<IPaymentIntent> {
    return this.apiRequestService.post<IPaymentIntent>(`${this.orderUrl}/payment-intent`);
  }

  newOrder(paymentIntentId: string) {
    return this.apiRequestService.post<Order>(this.orderUrl, { paymentIntentId });
  }
}
