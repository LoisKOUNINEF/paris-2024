import { Injectable } from '@angular/core';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { Observable } from 'rxjs';
import { Cart } from './cart.model';
import { CartDto } from './cart.dto';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartUrl = '/cart';
  private readonly addToCartUrl = `${this.cartUrl}/add-to`;

  constructor(private apiRequestService: ApiRequestService) { }

  findUserCart(): Observable<Cart> {
    return this.apiRequestService.get<Cart>(this.cartUrl);
  }

  addToCart(dto: CartDto): Observable<Cart> {
    return this.apiRequestService.patch<Cart>(this.addToCartUrl, dto)
  }

// No API endpoints yet
  // removeFromCart(bundleId: string): Observable<Cart> {
  //   return this.apiRequestService.delete<Cart>(`${this.handleCartUrl}/${bundleId}`)
  // }

  // emptyCart(): Observable<Cart> {
  //   return this.apiRequestService.delete<Cart>(this.emptyCartUrl)
  // }
}
