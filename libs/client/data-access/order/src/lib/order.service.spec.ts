import { TestBed } from '@angular/core/testing';
import { OrderService } from './order.service';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { of } from 'rxjs';
import { Order } from './order.model';
import { IOrderEntity, IOrderTickets } from '@paris-2024/shared-interfaces';

describe('OrderService', () => {
  let service: OrderService;
  let apiRequestService: jest.Mocked<ApiRequestService>;

  beforeEach(() => {
    const apiRequestServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        OrderService,
        { provide: ApiRequestService, useValue: apiRequestServiceMock }
      ]
    });

    service = TestBed.inject(OrderService);
    apiRequestService = TestBed.inject(ApiRequestService) as jest.Mocked<ApiRequestService>;
  });

  it('should call findAll', () => {
    const mockOrders: Order[] = [];
    apiRequestService.get.mockReturnValue(of(mockOrders));

    service.findAll().subscribe(response => {
      expect(response).toEqual(mockOrders);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/orders');
  });

  it('should call findUserOrders', () => {
    const mockUserOrders: IOrderEntity[] = [];
    apiRequestService.get.mockReturnValue(of(mockUserOrders));

    service.findUserOrders().subscribe(response => {
      expect(response).toEqual(mockUserOrders);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/orders/user-orders');
  });

  it('should call findOne with correct ID', () => {
    const orderId = 'abc123';
    const mockOrderTickets: IOrderTickets = { orderId, tickets: [], totalPrice: 100, userId: 'id' };
    apiRequestService.get.mockReturnValue(of(mockOrderTickets));

    service.findOne(orderId).subscribe(response => {
      expect(response).toEqual(mockOrderTickets);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith(`/orders/${orderId}`);
  });

  it('should call newOrder', () => {
    const newOrder: Order = { bundles: [], totalPrice: 1000, tickets: [] } as unknown as Order;
    apiRequestService.post.mockReturnValue(of(newOrder));

    service.newOrder().subscribe(response => {
      expect(response).toEqual(newOrder);
    });

    expect(apiRequestService.post).toHaveBeenCalledWith('/orders');
  });
});
