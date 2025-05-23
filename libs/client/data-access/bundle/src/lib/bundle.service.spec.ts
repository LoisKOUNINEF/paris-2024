import { TestBed } from '@angular/core/testing';
import { BundleService } from './bundle.service';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { of } from 'rxjs';
import { BundleDto } from './bundle.dto';
import { Bundle } from './bundle.model';
import { IBundleSales } from '@paris-2024/shared-interfaces';

describe('BundleService', () => {
  let service: BundleService;
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
        BundleService,
        { provide: ApiRequestService, useValue: apiRequestServiceMock }
      ]
    });

    service = TestBed.inject(BundleService);
    apiRequestService = TestBed.inject(ApiRequestService) as jest.Mocked<ApiRequestService>;
  });

  it('should call findAll', () => {
    const mockBundles: Bundle[] = [];
    apiRequestService.get.mockReturnValue(of(mockBundles));

    service.findAll().subscribe(response => {
      expect(response).toEqual(mockBundles);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/bundles');
  });

  it('should call findOneByName with correct name', () => {
    const mockBundle: Bundle = { name: 'Gold', price: 10000 } as Bundle;
    apiRequestService.get.mockReturnValue(of(mockBundle));

    service.findOneByName('Gold').subscribe(response => {
      expect(response).toEqual(mockBundle);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/bundles?name=Gold');
  });

  it('should call findOneById with correct ID', () => {
    const mockBundle: Bundle = { name: 'Gold', price: 10000 } as Bundle;
    apiRequestService.get.mockReturnValue(of(mockBundle));

    service.findOneById('1').subscribe(response => {
      expect(response).toEqual(mockBundle);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/bundles/1');
  });

  it('should call create with correct payload', () => {
    const dto: BundleDto = { name: 'Silver', price: 2000 } as BundleDto;
    const created: Bundle = { name: 'Silver', price: 10000 } as Bundle;
    apiRequestService.post.mockReturnValue(of(created));

    service.create(dto).subscribe(response => {
      expect(response).toEqual(created);
    });

    expect(apiRequestService.post).toHaveBeenCalledWith('/bundles', dto);
  });

  it('should call update with correct payload and ID', () => {
    const dto: BundleDto = { name: 'Platinum' } as BundleDto;
    const updated: Bundle = { name: 'Platinum' } as Bundle;
    apiRequestService.patch.mockReturnValue(of(updated));

    service.update(dto, '3').subscribe(response => {
      expect(response).toEqual(updated);
    });

    expect(apiRequestService.patch).toHaveBeenCalledWith('/bundles/3', dto);
  });

  it('should call delete with correct ID', () => {
    apiRequestService.delete.mockReturnValue(of({}));

    service.delete('4').subscribe(response => {
      expect(response).toEqual({});
    });

    expect(apiRequestService.delete).toHaveBeenCalledWith('/bundles/4');
  });

  it('should call getWithSales', () => {
    const mockSales: IBundleSales[] = [];
    apiRequestService.get.mockReturnValue(of(mockSales));

    service.getWithSales().subscribe(response => {
      expect(response).toEqual(mockSales);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith('/bundles/sales');
  });
});
