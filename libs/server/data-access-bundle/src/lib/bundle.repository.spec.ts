import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BundleRepository } from './bundle.repository';
import { Bundle } from './bundle.entity';
import { CreateBundleDto, UpdateBundleDto } from './bundle.dto';
import { createEntityMock } from '@paris-2024/shared-mocks';
import { In } from 'typeorm';

const { mockEntity } = createEntityMock(Bundle);
const mockBundle: Bundle = {
  ...mockEntity,
  id: 'bundle-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'Mock Bundle',
  price: 100,
  ticketAmount: 1,
  isAvailable: true,
  deletedAt: null,
};

jest.mock('./bundle.exceptions', () => ({
  bundleAlreadyExists: jest.fn().mockImplementation(() => {
    throw new Error('Bundle already exists');
  }),
  bundleNotFound: jest.fn().mockImplementation(() => {
    throw new Error('Bundle not found');
  })
}));

describe('BundleRepository', () => {
  let bundleRepository: BundleRepository;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundleRepository,
        {
          provide: getRepositoryToken(Bundle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    bundleRepository = module.get<BundleRepository>(BundleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(bundleRepository).toBeDefined();
  });

  describe('getBundles', () => {
    it('should return all available bundles when no name is provided', async () => {
      const bundles = [
        mockBundle,
        { ...mockBundle, id: 'second-bundle-id' },
      ];
      mockRepository.find.mockResolvedValue(bundles);

      const result = await bundleRepository.getBundles();

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { deletedAt: undefined } });
      expect(result).toEqual(bundles);
    });

    it('should return a single bundle when name is provided', async () => {
      jest.spyOn(bundleRepository, 'getOneByName').mockResolvedValue(mockBundle);

      const result = await bundleRepository.getOneByName('Mock Bundle');

      expect(bundleRepository.getOneByName).toHaveBeenCalledWith(mockBundle.name);
      expect(result).toEqual(mockBundle);
    });
  });

  describe('getManyByIds', () => {
    it('should return all bundles which id is in argument', async () => {
      const bundles = [
        mockBundle,
        { ...mockBundle, id: 'second-bundle-id' },
        { ...mockBundle, id: 'third-bundle.id'}
      ];
      mockRepository.find.mockResolvedValue(bundles);

      const result = await bundleRepository.getManyByIds([bundles[0].id, bundles[1].id]);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { id: In([bundles[0].id, bundles[1].id]) } });
      expect(result).toEqual(bundles);
    });
  });

  describe('getOneByName', () => {
    it('should return a bundle by name', async () => {
      mockRepository.findOne.mockResolvedValue(mockBundle);

      const result = await bundleRepository.getOneByName(mockBundle.name);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: mockBundle.name,
          deletedAt: undefined,
        },
      });
      expect(result).toEqual(mockBundle);
    });

    it('should return null if no bundle with the name exists', async () => {
      const bundleName = 'Non-existent Bundle';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await bundleRepository.getOneByName(bundleName);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: bundleName,
          deletedAt: undefined,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('getOneById', () => {
    it('should return a bundle by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockBundle);

      const result = await bundleRepository.getOneById(mockBundle.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBundle.id },
      });
      expect(result).toEqual(mockBundle);
    });

    it('should return null if no bundle with the id exists', async () => {
      const bundleId = 'non-existent-id';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await bundleRepository.getOneById(bundleId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: bundleId },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new bundle if name does not exist', async () => {
      const createDto: CreateBundleDto = {
        name: 'New Bundle',
        price: 150,
        ticketAmount: 7,
        isAvailable: true,
      };
      
      const newBundle = { id: 'NewBundleId', ...createDto, deletedAt: null };
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newBundle);
      mockRepository.save.mockResolvedValue(newBundle);

      const result = await bundleRepository.create(createDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ name: createDto.name });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(newBundle);
      expect(result).toEqual(newBundle);
    });

    it('should throw an error if bundle with the same name already exists', async () => {
      const createDto: CreateBundleDto = {
        name: 'Existing Bundle',
        price: 150,
        ticketAmount: 7,
        isAvailable: true,
      };
      
      const existingBundle = { id: 'ExistingBundleId', ...createDto, deletedAt: null };
      mockRepository.findOneBy.mockResolvedValue(existingBundle);

      await expect(bundleRepository.create(createDto)).rejects.toThrow('Bundle already exists');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ name: createDto.name });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing active bundle', async () => {
      const updateDto: UpdateBundleDto = {
        price: 120,
        isAvailable: false,
      };
      
      const updatedBundle = { ...mockBundle, ...updateDto };
      
      jest.spyOn(bundleRepository, 'getOneById').mockResolvedValue(mockBundle);
      mockRepository.save.mockResolvedValue(updatedBundle);

      const result = await bundleRepository.update(mockBundle.id, updateDto);

      expect(bundleRepository.getOneById).toHaveBeenCalledWith(mockBundle.id);
      expect(mockRepository.save).toHaveBeenCalledWith(Object.assign(mockBundle, updateDto));
      expect(result).toEqual(updatedBundle);
    });

    it('should restore a deleted bundle when updating', async () => {
      const bundleId = 'soft-deleted-bundle';
      const updateDto: UpdateBundleDto = {
        price: 120,
        isAvailable: true,
      };
      
      const deletedBundle = { 
        ...mockBundle,
        id: bundleId,
        deletedAt: new Date(),
        isAvailable: false,
      };
      
      const restoredBundle = { 
        ...deletedBundle, 
        ...updateDto, 
        deletedAt: null 
      };
      
      jest.spyOn(bundleRepository, 'getOneById').mockResolvedValue(deletedBundle);
      mockRepository.save.mockResolvedValue(restoredBundle);

      const result = await bundleRepository.update(bundleId, updateDto);

      expect(bundleRepository.getOneById).toHaveBeenCalledWith(bundleId);
      expect(mockRepository.save).toHaveBeenCalledWith(
        Object.assign(deletedBundle, {
          deletedAt: null,
          ...updateDto,
        })
      );
      expect(result).toEqual(restoredBundle);
    });

    it('should throw an error if bundle not found', async () => {
      const bundleId = 'non-existent-id';
      const updateDto: UpdateBundleDto = {
        price: 120,
      };
      
      jest.spyOn(bundleRepository, 'getOneById').mockResolvedValue(null);

      await expect(bundleRepository.update(bundleId, updateDto)).rejects.toThrow('Bundle not found');
      expect(bundleRepository.getOneById).toHaveBeenCalledWith(bundleId);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft remove an existing bundle', async () => {      
      const softRemovedBundle = { ...mockBundle, deletedAt: new Date() };
      
      jest.spyOn(bundleRepository, 'getOneById').mockResolvedValue(mockBundle);
      mockRepository.softRemove.mockResolvedValue(softRemovedBundle);

      const result = await bundleRepository.remove(mockBundle.id);

      expect(bundleRepository.getOneById).toHaveBeenCalledWith(mockBundle.id);
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockBundle);
      expect(result).toEqual(softRemovedBundle);
    });

    it('should throw an error if bundle not found', async () => {
      const bundleId = 'non-existent-id';
      jest.spyOn(bundleRepository, 'getOneById').mockResolvedValue(null);

      await expect(bundleRepository.remove(bundleId)).rejects.toThrow('Bundle not found');
      expect(bundleRepository.getOneById).toHaveBeenCalledWith(bundleId);
      expect(mockRepository.softRemove).not.toHaveBeenCalled();
    });

    it('should throw an error if bundle is already deleted', async () => {
      const deletedBundle = { 
        ...mockBundle,
        deletedAt: new Date() 
      };
      
      jest.spyOn(bundleRepository, 'getOneById').mockResolvedValue(deletedBundle);

      await expect(bundleRepository.remove(mockBundle.id)).rejects.toThrow('Bundle not found');
      expect(bundleRepository.getOneById).toHaveBeenCalledWith(mockBundle.id);
      expect(mockRepository.softRemove).not.toHaveBeenCalled();
    });
  });
});