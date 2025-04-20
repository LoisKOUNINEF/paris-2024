import { Test, TestingModule } from '@nestjs/testing';
import { BundleController } from './bundle.controller';
import { BundleService } from '@paris-2024/server-business-logic-bundle';
import { CreateBundleDto, UpdateBundleDto, Bundle } from '@paris-2024/server-data-access-bundle';
import { IBundleSales } from '@paris-2024/shared-interfaces';

describe('BundleController', () => {
  let controller: BundleController;
  let bundleService: BundleService;

  const mockBundle: Bundle = {
    id: 'bundle-id-1',
    name: 'Test Bundle',
    price: 100,
    isAvailable: true,
    ticketAmount: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockBundles: Bundle[] = [
    mockBundle,
    {
      id: 'bundle-id-2',
      name: 'Another Bundle',
      price: 200,
      isAvailable: true,
      ticketAmount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  const mockCreateBundleDto: CreateBundleDto = {
    name: 'New Bundle',
    price: 150,
    isAvailable: true,
    ticketAmount: 3,
  };

  const mockUpdateBundleDto: UpdateBundleDto = {
    name: 'Updated Bundle',
    price: 180,
    isAvailable: false,
    ticketAmount: 3,
  };

  const mockBundleSales: IBundleSales = {
    bundle: mockBundle,
    sales: 7,
  };

  const mockAllBundleSales: IBundleSales[] = [
    mockBundleSales,
    {
    	bundle: {
	      id: 'bundle-id-2',
	      name: 'Another Bundle',
	      price: 200,
	      isAvailable: true,
	      ticketAmount: 3,
	      createdAt: new Date(),
	      updatedAt: new Date(),
	      deletedAt: null,
	    },
	  	sales: 15,
		},
  ];

  const mockBundleService = {
    createBundle: jest.fn(),
    getBundles: jest.fn(),
    updateBundle: jest.fn(),
    getAllWithSales: jest.fn(),
    getOneWithSales: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BundleController],
      providers: [
        {
          provide: BundleService,
          useValue: mockBundleService,
        },
      ],
    }).compile();

    controller = module.get<BundleController>(BundleController);
    bundleService = module.get<BundleService>(BundleService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCart', () => {
    it('should create a new bundle successfully', async () => {
      mockBundleService.createBundle.mockResolvedValue(mockBundle);

      const result = await controller.createCart(mockCreateBundleDto);

      expect(result).toEqual(mockBundle);
      expect(bundleService.createBundle).toHaveBeenCalledWith(mockCreateBundleDto);
      expect(bundleService.createBundle).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when bundle creation fails', async () => {
      mockBundleService.createBundle.mockResolvedValue(undefined);

      const result = await controller.createCart(mockCreateBundleDto);

      expect(result).toBeUndefined();
      expect(bundleService.createBundle).toHaveBeenCalledWith(mockCreateBundleDto);
    });

    it('should propagate exceptions from the service', async () => {
      const errorMessage = 'Failed to create bundle';
      mockBundleService.createBundle.mockRejectedValue(new Error(errorMessage));

      await expect(controller.createCart(mockCreateBundleDto)).rejects.toThrow(errorMessage);
      expect(bundleService.createBundle).toHaveBeenCalledWith(mockCreateBundleDto);
    });
  });

  describe('getBundles', () => {
    it('should return all bundles', async () => {
      mockBundleService.getBundles.mockResolvedValue(mockBundles);

      const result = await controller.getBundles();

      expect(result).toEqual(mockBundles);
      expect(bundleService.getBundles).toHaveBeenCalledTimes(1);
    });

    it('should return a single bundle if that is what the service returns', async () => {
      mockBundleService.getBundles.mockResolvedValue(mockBundle);

      const result = await controller.getBundles();

      expect(result).toEqual(mockBundle);
      expect(bundleService.getBundles).toHaveBeenCalledTimes(1);
    });

    it('should return null when no bundles are found', async () => {
      mockBundleService.getBundles.mockResolvedValue(null);

      const result = await controller.getBundles();

      expect(result).toBeNull();
      expect(bundleService.getBundles).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from the service', async () => {
      const errorMessage = 'Failed to fetch bundles';
      mockBundleService.getBundles.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getBundles()).rejects.toThrow(errorMessage);
      expect(bundleService.getBundles).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateBundle', () => {
    const bundleId = 'bundle-id-1';

    it('should update a bundle successfully', async () => {
      const updatedBundle = { ...mockBundle, ...mockUpdateBundleDto };
      mockBundleService.updateBundle.mockResolvedValue(updatedBundle);

      const result = await controller.updateBundle(mockUpdateBundleDto, bundleId);

      expect(result).toEqual(updatedBundle);
      expect(bundleService.updateBundle).toHaveBeenCalledWith(bundleId, mockUpdateBundleDto);
      expect(bundleService.updateBundle).toHaveBeenCalledTimes(1);
    });

    it('should return null when bundle update fails', async () => {
      mockBundleService.updateBundle.mockResolvedValue(null);

      const result = await controller.updateBundle(mockUpdateBundleDto, bundleId);

      expect(result).toBeNull();
      expect(bundleService.updateBundle).toHaveBeenCalledWith(bundleId, mockUpdateBundleDto);
    });

    it('should propagate exceptions from the service', async () => {
      const errorMessage = 'Failed to update bundle';
      mockBundleService.updateBundle.mockRejectedValue(new Error(errorMessage));

      await expect(controller.updateBundle(mockUpdateBundleDto, bundleId)).rejects.toThrow(errorMessage);
      expect(bundleService.updateBundle).toHaveBeenCalledWith(bundleId, mockUpdateBundleDto);
    });
  });

  describe('getAllSales', () => {
    it('should return sales for all bundles', async () => {
      mockBundleService.getAllWithSales.mockResolvedValue(mockAllBundleSales);

      const result = await controller.getAllSales();

      expect(result).toEqual(mockAllBundleSales);
      expect(bundleService.getAllWithSales).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when no sales data is available', async () => {
      mockBundleService.getAllWithSales.mockResolvedValue(undefined);

      const result = await controller.getAllSales();

      expect(result).toBeUndefined();
      expect(bundleService.getAllWithSales).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from the service', async () => {
      const errorMessage = 'Failed to fetch bundle sales';
      mockBundleService.getAllWithSales.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getAllSales()).rejects.toThrow(errorMessage);
      expect(bundleService.getAllWithSales).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOneSales', () => {
    const bundleId = 'bundle-id-1';

    it('should return sales for one specific bundle', async () => {
      mockBundleService.getOneWithSales.mockResolvedValue(mockBundleSales);

      const result = await controller.getOneSales(bundleId);

      expect(result).toEqual(mockBundleSales);
      expect(bundleService.getOneWithSales).toHaveBeenCalledWith(bundleId);
      expect(bundleService.getOneWithSales).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when sales data for the bundle is not found', async () => {
      mockBundleService.getOneWithSales.mockResolvedValue(undefined);

      const result = await controller.getOneSales(bundleId);

      expect(result).toBeUndefined();
      expect(bundleService.getOneWithSales).toHaveBeenCalledWith(bundleId);
    });

    it('should propagate exceptions from the service', async () => {
      const errorMessage = 'Failed to fetch bundle sales';
      mockBundleService.getOneWithSales.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getOneSales(bundleId)).rejects.toThrow(errorMessage);
      expect(bundleService.getOneWithSales).toHaveBeenCalledWith(bundleId);
    });
  });
});
