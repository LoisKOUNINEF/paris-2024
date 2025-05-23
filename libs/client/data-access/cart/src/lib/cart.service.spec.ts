import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { of } from 'rxjs';
import { Cart } from './cart.model';
import { CartDto } from './cart.dto';

describe('CartService', () => {
  let service: CartService;
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
        CartService,
        { provide: ApiRequestService, useValue: apiRequestServiceMock }
      ]
    });

    service = TestBed.inject(CartService);
    apiRequestService = TestBed.inject(ApiRequestService) as jest.Mocked<ApiRequestService>;
  });

  it('should call findUserCart', () => {
    const mockCart: Cart = { id: '1', bundles: [] } as unknown as Cart;
    apiRequestService.get.mockReturnValue(of(mockCart));

    service.findUserCart().subscribe(response => {
      expect(response).toEqual(mockCart);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/cart');
  });

  it('should call addToCart with correct DTO', () => {
    const dto: CartDto = { bundleId: '123', quantity: 2 } as CartDto;
    const updatedCart: Cart = { id: '1', bundles: [] } as unknown as Cart;
    apiRequestService.post.mockReturnValue(of(updatedCart));

    service.addToCart(dto).subscribe(response => {
      expect(response).toEqual(updatedCart);
    });

    expect(apiRequestService.post).toHaveBeenCalledWith('/cart/add-to', dto);
  });

  it('should call updateQuantity with correct DTO', () => {
    const dto: CartDto = { bundleId: '123', quantity: 5 } as CartDto;
    const updatedCart: Cart = { id: '1', bundles: [] } as unknown as Cart;
    apiRequestService.patch.mockReturnValue(of(updatedCart));

    service.updateQuantity(dto).subscribe(response => {
      expect(response).toEqual(updatedCart);
    });

    expect(apiRequestService.patch).toHaveBeenCalledWith('/cart/add-to', dto);
  });
});
