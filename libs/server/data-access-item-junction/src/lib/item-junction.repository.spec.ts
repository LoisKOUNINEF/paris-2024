import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemJunctionRepository } from './item-junction.repository';
import { ItemJunction } from './item-junction.entity';
import { CreateItemJunctionDto, UpdateItemJunctionDto } from './item-junction.dto';
import { createEntityMock } from '@paris-2024/shared-mocks';

const { mockEntity } = createEntityMock(ItemJunction);
const mockItemJunction: ItemJunction = {
  ...mockEntity,
  id: 'itemJunction-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  quantity: 2,
  bundleId: 'bundle-id',
  cartId: '',
  orderId: '',
  deletedAt: null,
};

describe('ItemJunctionRepository', () => {
  let itemJunctionRepository: ItemJunctionRepository;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemJunctionRepository,
        {
          provide: getRepositoryToken(ItemJunction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    itemJunctionRepository = module.get<ItemJunctionRepository>(ItemJunctionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(itemJunctionRepository).toBeDefined();
  });

  describe('getManyByRelationshipId', () => {
    it('should get many item junctions by cart relationship', async () => {
      const relationshipType = 'cart';
      const relationshipId = 'cart-123';
      const mockResults = [{ id: 'junction-1', bundle: { id: 'bundle-1' } }];
      
      mockQueryBuilder.getRawMany.mockResolvedValue(mockResults);

      const result = await itemJunctionRepository.getManyByRelationshipId(relationshipType, relationshipId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('junction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('bundle', 'bundle', 'junction.bundleId = bundle.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('junction.cartId = :relationshipId', { relationshipId });
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });

    it('should get many item junctions by order relationship', async () => {
      const relationshipType = 'order';
      const relationshipId = 'order-123';
      const mockResults = [{ id: 'junction-1', bundle: { id: 'bundle-1' } }];
      
      mockQueryBuilder.getRawMany.mockResolvedValue(mockResults);

      const result = await itemJunctionRepository.getManyByRelationshipId(relationshipType, relationshipId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('junction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('bundle', 'bundle', 'junction.bundleId = bundle.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('junction.orderId = :relationshipId', { relationshipId });
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });
  });

  describe('getOneWithBundle', () => {
    it('should get one item junction with bundled data', async () => {
      const junctionId = 'junction-123';
      const mockResult = { id: junctionId, bundle: { id: 'bundle-1' } };
      
      mockQueryBuilder.getRawOne.mockResolvedValue(mockResult);

      const result = await itemJunctionRepository.getOneWithBundle(junctionId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('junction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('bundle', 'bundle', 'junction.bundleId = bundle.id');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('junction.id = :junctionId', { id: junctionId });
      expect(mockQueryBuilder.getRawOne).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOne', () => {
    it('should find one item junction by cart and bundle IDs', async () => {
      const cartId = 'cart-123';
      const bundleId = 'bundle-123';
      
      mockRepository.findOne.mockResolvedValue(mockItemJunction);

      const result = await itemJunctionRepository.getOne(cartId, bundleId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cartId, bundleId }
      });
      expect(result).toEqual(mockItemJunction);
    });
  });

  describe('getOneSales', () => {
    it('should get total sales quantity for a bundle', async () => {
      const bundleId = 'bundle-123';
      const mockSales = [
        { quantity: 2 },
        { quantity: 3 },
      ];
      
      mockQueryBuilder.getRawMany.mockResolvedValue(mockSales);

      const result = await itemJunctionRepository.getOneWithSales(bundleId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('junction');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('item_junction');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('item_junction.bundleId = :id', { id: bundleId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item_junction.orderId != null');
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should return 0 when no sales found', async () => {
      const bundleId = 'bundle-123';
      
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await itemJunctionRepository.getOneWithSales(bundleId);

      expect(result).toBe(0);
    });
  });

  describe('getAllSales', () => {
    it('should get sales for multiple bundle IDs', async () => {
      const bundleIds = ['bundle-1', 'bundle-2', 'bundle-3'];
      const mockSales = [
        { item_junction_bundleId: 'bundle-1', item_junction_quantity: 5 },
        { item_junction_bundleId: 'bundle-1', item_junction_quantity: 3 },
        { item_junction_bundleId: 'bundle-2', item_junction_quantity: 2 },
      ];
      
      mockQueryBuilder.getRawMany.mockResolvedValue(mockSales);

      const result = await itemJunctionRepository.getAllWithSales(bundleIds);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('junction');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(['item_junction.bundleId', 'item_junction.quantity']);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('item_junction.bundleId IN (:...ids)', { ids: bundleIds });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item_junction.orderId IS NOT NULL');
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      
      expect(result).toEqual({
        'bundle-1': 8,
        'bundle-2': 2,
        'bundle-3': 0,
      });
    });

    it('should return empty object when bundleIds array is empty', async () => {
      const bundleIds: Array<string> = [];
      
      const result = await itemJunctionRepository.getAllWithSales(bundleIds);

      expect(mockQueryBuilder.getRawMany).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('updateQuantity', () => {
    it('should update the quantity of an item junction', async () => {
      const junctionId = 'junction-123';
      const newQuantity = 5;
      const existingJunction = { ...mockItemJunction, id: junctionId, quantity: 2 };
      const updatedJunction = { ...existingJunction, quantity: newQuantity };
      
      mockRepository.findOne.mockResolvedValue(existingJunction);
      mockRepository.save.mockResolvedValue(updatedJunction);

      const result = await itemJunctionRepository.updateQuantity(junctionId, newQuantity);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: junctionId } });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ quantity: newQuantity }));
      expect(result).toEqual(existingJunction);
    });

    it('should return null if junction not found', async () => {
      const junctionId = 'non-existent-id';
      const newQuantity = 5;
      
      mockRepository.findOne.mockResolvedValue(null);

      const result = await itemJunctionRepository.updateQuantity(junctionId, newQuantity);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: junctionId } });
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('mergeJunctions', () => {
    it('should merge guest junctions with user junctions', async () => {
      const guestJunctions = [
        { id: 'guest-1', bundle: { id: 'bundle-1' }, quantity: 2 },
        { id: 'guest-2', bundle: { id: 'bundle-2' }, quantity: 3 },
        { id: 'guest-3', bundle: { id: 'bundle-3' }, quantity: 1 },
      ];
      
      const userJunctions = [
        { id: 'user-1', bundle: { id: 'bundle-1' }, quantity: 1 },
        { id: 'user-2', bundle: { id: 'bundle-3' }, quantity: 4 },
      ];

      const updateSpy = jest.spyOn(itemJunctionRepository, 'update').mockResolvedValue({} as any);

      await itemJunctionRepository.mergeJunctions(guestJunctions as any, userJunctions as any);

      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(updateSpy).toHaveBeenCalledWith('user-1', { quantity: 3 });
      expect(updateSpy).toHaveBeenCalledWith('user-2', { quantity: 5 });
    });
  });

  describe('create', () => {
    it('should create and save a new item junction', async () => {
      const dto: CreateItemJunctionDto = {
        quantity: 2,
        bundleId: 'bundle-123',
        cartId: 'cart-123',
      };
      
      const itemJunction = { id: 'item-junction-123', ...dto };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(itemJunction);
      mockRepository.save.mockResolvedValue(itemJunction);

      const result = await itemJunctionRepository.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(itemJunction);
      expect(result).toEqual(itemJunction);
    });

    it('should update quantity if item already exists in cart', async () => {
      const dto: CreateItemJunctionDto = {
        quantity: 2,
        bundleId: 'bundle-123',
        cartId: 'cart-123',
      };
      
      const existingJunction = { 
        id: 'existing-junction',
        bundleId: dto.bundleId,
        cartId: dto.cartId,
        quantity: 3
      };
      
      const itemJunction = { id: 'new-junction', ...dto };
      
      mockRepository.findOne.mockResolvedValue(existingJunction);
      const updateQuantitySpy = jest.spyOn(itemJunctionRepository, 'updateQuantity').mockResolvedValue(existingJunction as any);
      mockRepository.create.mockReturnValue(itemJunction);
      mockRepository.save.mockResolvedValue(itemJunction);

      const result = await itemJunctionRepository.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cartId: dto.cartId, bundleId: dto.bundleId }
      });
      expect(updateQuantitySpy).toHaveBeenCalledWith(existingJunction.id, dto.quantity);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(itemJunction);
      expect(result).toEqual(itemJunction);
    });

    it('should not check for existing item if cartId is not provided', async () => {
      const dto: CreateItemJunctionDto = {
        quantity: 2,
        bundleId: 'bundle-123',
      };
      
      const itemJunction = { id: 'item-junction-123', ...dto };
      mockRepository.create.mockReturnValue(itemJunction);
      mockRepository.save.mockResolvedValue(itemJunction);

      const result = await itemJunctionRepository.create(dto);

      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(itemJunction);
      expect(result).toEqual(itemJunction);
    });
  });

  describe('update', () => {
    it('should update an existing item junction', async () => {
      const dto: UpdateItemJunctionDto = {
        quantity: 3,
        bundleId: 'bundle-123',
        cartId: 'cart-456',
      };
      
      const updatedItemJunction = { ...mockItemJunction, ...dto };
      
      mockRepository.findOne.mockResolvedValue(mockItemJunction);
      mockRepository.save.mockResolvedValue(updatedItemJunction);

      const result = await itemJunctionRepository.update(mockItemJunction.id, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockItemJunction.id } });
      expect(mockRepository.save).toHaveBeenCalledWith(Object.assign(mockItemJunction, dto));
      expect(result).toEqual(updatedItemJunction);
    });

    it('should return null if item junction not found', async () => {
      const id = 'non-existent-id';
      const dto: UpdateItemJunctionDto = {
        quantity: 3,
        bundleId: 'bundle-123',
      };
      
      mockRepository.findOne.mockResolvedValue(null);

      const result = await itemJunctionRepository.update(id, dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove an existing item junction', async () => {    
      const deleteResult = { affected: 1, raw: {} };
      
      mockRepository.findOne.mockResolvedValue(mockItemJunction);
      mockRepository.delete.mockResolvedValue(deleteResult);

      const result = await itemJunctionRepository.remove(mockItemJunction.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockItemJunction.id } });
      expect(mockRepository.delete).toHaveBeenCalledWith(mockItemJunction.id);
      expect(result).toEqual(deleteResult);
    });

    it('should return null if item junction not found', async () => {
      const id = 'wrongId';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await itemJunctionRepository.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});