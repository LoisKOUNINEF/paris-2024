import { Test, TestingModule } from '@nestjs/testing';
import { BundleService } from './bundle.service';
import { BundleRepository, Bundle, bundleNotFound } from '@paris-2024/server-data-access-bundle';
import { ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';
import { IBundleSales } from '@paris-2024/shared-interfaces';

jest.mock('@paris-2024/server-data-access-bundle', () => {
  const originalModule = jest.requireActual('@paris-2024/server-data-access-bundle');
  return {
    ...originalModule,
    bundleNotFound: jest.fn()
  };
});

describe('BundleService', () => {
  let service: BundleService;
  let bundleRepository: BundleRepository;
  let itemJunctionRepository: ItemJunctionRepository;

  const mockBundle: Bundle = {
    id: 'bundle-1',
    name: 'Test Bundle',
    ticketAmount: 2,
    price: 175,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  };

  const mockBundles: Array<Bundle> = [
    { ...mockBundle },
    { 
      id: 'bundle-2', 
      name: 'Test Bundle 2',
      ticketAmount: 1,
      price: 100,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    }
  ];

  const mockBundleRepository = {
    getOneById: jest.fn(),
    getOneByName: jest.fn(),
    getBundles: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  };

  const mockItemJunctionRepository = {
    getOneWithSales: jest.fn(),
    getAllWithSales: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundleService,
        { provide: BundleRepository, useValue: mockBundleRepository },
        { provide: ItemJunctionRepository, useValue: mockItemJunctionRepository }
      ],
    }).compile();

    service = module.get<BundleService>(BundleService);
    bundleRepository = module.get<BundleRepository>(BundleRepository);
    itemJunctionRepository = module.get<ItemJunctionRepository>(ItemJunctionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOneSales', () => {
    it('should return sales count for a bundle', async () => {
      const bundleId = 'bundle-1';
      const expectedSalesCount: IBundleSales = {
        bundle: mockBundle,
        sales: 5
      };

      mockBundleRepository.getOneById.mockResolvedValue(mockBundle);
      mockItemJunctionRepository.getOneWithSales.mockResolvedValue(5);

      const result = await service.getOneWithSales(bundleId);

      expect(bundleRepository.getOneById).toHaveBeenCalledWith(bundleId);
      expect(itemJunctionRepository.getOneWithSales).toHaveBeenCalledWith(bundleId);
      expect(result).toEqual(expectedSalesCount);
    });

    it('should call bundleNotFound and return undefined if bundle not found', async () => {
      const bundleId = 'non-existent-bundle';

      mockBundleRepository.getOneById.mockResolvedValue(null);

      const result = await service.getOneWithSales(bundleId);

      expect(bundleRepository.getOneById).toHaveBeenCalledWith(bundleId);
      expect(bundleNotFound).toHaveBeenCalled();
      expect(itemJunctionRepository.getOneWithSales).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('getAllSales', () => {
    it('should return sales count for all bundles', async () => {
      const expectedSalesCount: IBundleSales[] = [
        { bundle: mockBundles[0], sales: 5 },
        { bundle: mockBundles[1], sales: 10 }
      ];

      const salesByBundleId = {
        'bundle-1': 5,
        'bundle-2': 10
      };

      mockBundleRepository.getBundles.mockResolvedValue(mockBundles);
      mockItemJunctionRepository.getAllWithSales.mockResolvedValue(salesByBundleId);

      const result = await service.getAllWithSales();

      expect(bundleRepository.getBundles).toHaveBeenCalled();
      expect(itemJunctionRepository.getAllWithSales).toHaveBeenCalledWith(['bundle-1', 'bundle-2']);
      expect(result).toEqual(expectedSalesCount);
    });

    it('should call bundleNotFound and return undefined if bundles not found', async () => {
      mockBundleRepository.getBundles.mockResolvedValue(null);

      const result = await service.getAllWithSales();

      expect(bundleRepository.getBundles).toHaveBeenCalled();
      expect(bundleNotFound).toHaveBeenCalled();
      expect(itemJunctionRepository.getAllWithSales).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle empty bundles array', async () => {
      mockBundleRepository.getBundles.mockResolvedValue([]);
      mockItemJunctionRepository.getAllWithSales.mockResolvedValue({});

      const result = await service.getAllWithSales();

      expect(bundleRepository.getBundles).toHaveBeenCalled();
      expect(itemJunctionRepository.getAllWithSales).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });
  });

  describe('getBundles', () => {
    it('should return all bundles when no name is provided', async () => {
      mockBundleRepository.getBundles.mockResolvedValue(mockBundles);

      const result = await service.getBundles();

      expect(bundleRepository.getBundles).toHaveBeenCalled();
      expect(bundleRepository.getOneByName).not.toHaveBeenCalled();
      expect(result).toEqual(mockBundles);
    });

    it('should return one bundle when name is provided', async () => {
      const bundleName = 'Test Bundle';
      mockBundleRepository.getOneByName.mockResolvedValue(mockBundle);

      const result = await service.getBundles(bundleName);

      expect(bundleRepository.getOneByName).toHaveBeenCalledWith(bundleName);
      expect(bundleRepository.getBundles).not.toHaveBeenCalled();
      expect(result).toEqual(mockBundle);
    });
  });

  describe('createBundle', () => {
    it('should create a bundle', async () => {
      const createBundleDto = { name: 'New Bundle', price: 100, ticketAmount: 4 };
      const createdBundle = { ...mockBundle, name: 'New Bundle', price: 100, ticketAmount: 4 };
      
      mockBundleRepository.create.mockResolvedValue(createdBundle);

      const result = await service.createBundle(createBundleDto);

      expect(bundleRepository.create).toHaveBeenCalledWith(createBundleDto);
      expect(result).toEqual(createdBundle);
    });
  });

  describe('updateBundle', () => {
    it('should update a bundle', async () => {
      const bundleId = 'bundle-1';
      const updateBundleDto = { name: 'Updated Bundle' };
      const updatedBundle = { ...mockBundle, name: 'Updated Bundle' };
      
      mockBundleRepository.update.mockResolvedValue(updatedBundle);

      const result = await service.updateBundle(bundleId, updateBundleDto);

      expect(bundleRepository.update).toHaveBeenCalledWith(bundleId, updateBundleDto);
      expect(result).toEqual(updatedBundle);
    });

    it('should return null if bundle to update is not found', async () => {
      const bundleId = 'non-existent-bundle';
      const updateBundleDto = { name: 'Updated Bundle' };
      
      mockBundleRepository.update.mockResolvedValue(null);

      const result = await service.updateBundle(bundleId, updateBundleDto);

      expect(bundleRepository.update).toHaveBeenCalledWith(bundleId, updateBundleDto);
      expect(result).toBeNull();
    });
  });

  describe('getOneByName', () => {
    it('should return a bundle by name', async () => {
      const bundleName = 'Test Bundle';
      
      mockBundleRepository.getOneByName.mockResolvedValue(mockBundle);

      const result = await service.getOneByName(bundleName);

      expect(bundleRepository.getOneByName).toHaveBeenCalledWith(bundleName);
      expect(result).toEqual(mockBundle);
    });
  });

  describe('getOneById', () => {
    it('should call the repository with the correct parameters', async () => {
      const bundleId = 'bundle-1';
      
      mockBundleRepository.getOneById.mockResolvedValue(mockBundle);

      await service.getOneById(bundleId);

      expect(bundleRepository.getOneById).toHaveBeenCalledWith(bundleId);
    });
  });

  describe('remove', () => {
    it('should remove a bundle', async () => {
      const bundleId = 'bundle-1';
      
      mockBundleRepository.remove.mockResolvedValue(mockBundle);

      const result = await service.remove(bundleId);

      expect(bundleRepository.remove).toHaveBeenCalledWith(bundleId);
      expect(result).toEqual(mockBundle);
    });

    it('should return undefined if bundle to remove is not found', async () => {
      const bundleId = 'non-existent-bundle';
      
      mockBundleRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(bundleId);

      expect(bundleRepository.remove).toHaveBeenCalledWith(bundleId);
      expect(result).toBeUndefined();
    });
  });
});