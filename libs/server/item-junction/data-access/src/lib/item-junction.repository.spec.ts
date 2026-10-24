import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { ItemJunctionRepository } from './item-junction.repository';
import { ItemJunction } from './item-junction.entity';

describe('ItemJunctionRepository', () => {
  let repository: ItemJunctionRepository;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    whereInIds: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
    execute: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const junctionModel = (overrides: Partial<IItemJunctionModel>): IItemJunctionModel => ({
    junction: 'junction-1',
    id: 'bundle-1',
    name: 'Solo',
    amount: 1,
    price: 50,
    quantity: 1,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemJunctionRepository,
        { provide: getRepositoryToken(ItemJunction), useValue: mockRepository },
      ],
    }).compile();

    repository = module.get<ItemJunctionRepository>(ItemJunctionRepository);

    mockRepository.create.mockImplementation((dto) => ({ ...dto }));
    mockRepository.save.mockImplementation(async (entity) => entity);
  });

  describe('getManyByRelationshipId', () => {
    it('should filter on the requested relationship column', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await repository.getManyByRelationshipId('order', 'order-1');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'item_junction.order_id::uuid = :relationshipId::uuid',
        { relationshipId: 'order-1' },
      );
    });

    it('should map raw rows to item junction models', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { junction: 'junction-1', quantity: 2, name: 'Solo', id: 'bundle-1', amount: 1, price: 50 },
      ]);

      await expect(repository.getManyByRelationshipId('cart', 'cart-1')).resolves.toEqual([
        junctionModel({ quantity: 2 }),
      ]);
    });
  });

  describe('create', () => {
    it('should add quantity to existing junction of the same bundle in cart', async () => {
      const existing = { id: 'junction-1', cartId: 'cart-1', bundleId: 'bundle-1', quantity: 2 };
      mockRepository.findOne.mockResolvedValue(existing);

      const result = await repository.create({ cartId: 'cart-1', bundleId: 'bundle-1', quantity: 3 });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cartId: 'cart-1', bundleId: 'bundle-1' },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'junction-1', quantity: 5 }));
      expect(result).toEqual(expect.objectContaining({ quantity: 5 }));
    });

    it('should create junction if bundle is not in cart yet', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const dto = { cartId: 'cart-1', bundleId: 'bundle-1', quantity: 3 };

      await repository.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(dto);
    });

    it('should not look for duplicates without cart', async () => {
      const dto = { orderId: 'order-1', bundleId: 'bundle-1', quantity: 3 };

      await repository.create(dto);

      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateQuantity', () => {
    it('should return null if junction does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(repository.updateQuantity('junction-1', 3)).resolves.toBeNull();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should save new quantity', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'junction-1', quantity: 1 });

      await repository.updateQuantity('junction-1', 3);

      expect(mockRepository.save).toHaveBeenCalledWith({ id: 'junction-1', quantity: 3 });
    });

    it('should remove junction when quantity is 0', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'junction-1', quantity: 1 });

      await repository.updateQuantity('junction-1', 0);

      expect(mockRepository.delete).toHaveBeenCalledWith('junction-1');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('mergeJunctions', () => {
    it('should add guest quantities to user junctions of the same bundle', async () => {
      const updateSpy = jest.spyOn(repository, 'update').mockResolvedValue(null);
      const createSpy = jest.spyOn(repository, 'create').mockResolvedValue(null);

      await repository.mergeJunctions(
        'user-cart',
        [junctionModel({ junction: 'guest-junction', quantity: 2 })],
        [junctionModel({ junction: 'user-junction', quantity: 3 })],
      );

      expect(updateSpy).toHaveBeenCalledWith('user-junction', { quantity: 5 });
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should move guest bundles missing from user cart', async () => {
      const updateSpy = jest.spyOn(repository, 'update').mockResolvedValue(null);
      const createSpy = jest.spyOn(repository, 'create').mockResolvedValue(null);

      await repository.mergeJunctions(
        'user-cart',
        [junctionModel({ junction: 'guest-junction', id: 'bundle-2', quantity: 2 })],
        [junctionModel({ junction: 'user-junction', id: 'bundle-1', quantity: 3 })],
      );

      expect(createSpy).toHaveBeenCalledWith({ cartId: 'user-cart', bundleId: 'bundle-2', quantity: 2 });
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should delete every guest junction once merged', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(null);

      await repository.mergeJunctions(
        'user-cart',
        [
          junctionModel({ junction: 'guest-junction-1', id: 'bundle-1' }),
          junctionModel({ junction: 'guest-junction-2', id: 'bundle-2' }),
        ],
        [junctionModel({ junction: 'user-junction', id: 'bundle-1' })],
      );

      expect(mockRepository.delete).toHaveBeenCalledTimes(2);
      expect(mockRepository.delete).toHaveBeenCalledWith('guest-junction-1');
      expect(mockRepository.delete).toHaveBeenCalledWith('guest-junction-2');
      expect(mockRepository.delete).not.toHaveBeenCalledWith('user-junction');
    });
  });

  describe('switchRelationship', () => {
    it('should detach junctions from cart and attach them to order', async () => {
      const junctions = [{ id: 'junction-1' }, { id: 'junction-2' }];
      mockQueryBuilder.execute.mockResolvedValue({ affected: 2 });
      mockRepository.findBy.mockResolvedValue(junctions);

      const result = await repository.switchRelationship(['junction-1', 'junction-2'], 'order-1');

      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ cartId: null, orderId: 'order-1' });
      expect(mockQueryBuilder.whereInIds).toHaveBeenCalledWith(['junction-1', 'junction-2']);
      expect(mockRepository.findBy).toHaveBeenCalledWith({ id: In(['junction-1', 'junction-2']), orderId: 'order-1' });
      expect(result).toBe(junctions);
    });

    it('should only move junctions still in a cart', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });

      await repository.switchRelationship(['junction-1'], 'order-1');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('cart_id IS NOT NULL');
    });

    it('should use the transaction manager when given', async () => {
      const transactionRepository = { ...mockRepository, findBy: jest.fn().mockResolvedValue([]) };
      const manager = { getRepository: jest.fn(() => transactionRepository) };
      mockQueryBuilder.execute.mockResolvedValue({ affected: 1 });

      await repository.switchRelationship(['junction-1'], 'order-1', manager as unknown as EntityManager);

      expect(manager.getRepository).toHaveBeenCalledWith(ItemJunction);
      expect(transactionRepository.findBy).toHaveBeenCalled();
      expect(mockRepository.findBy).not.toHaveBeenCalled();
    });

    it('should return empty array when nothing was updated', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });

      await expect(repository.switchRelationship(['junction-1'], 'order-1')).resolves.toEqual([]);
      expect(mockRepository.findBy).not.toHaveBeenCalled();
    });
  });

  describe('getOneWithSales', () => {
    it('should only count junctions attached to an order', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ quantity: 2 }, { quantity: 3 }]);

      await expect(repository.getOneWithSales('bundle-1')).resolves.toBe(5);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item_junction.order_id IS NOT NULL');
    });
  });

  describe('getAllWithSales', () => {
    it('should not query without bundle ids', async () => {
      await expect(repository.getAllWithSales([])).resolves.toEqual({});
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should sum sales per bundle and default unsold bundles to 0', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { bundle_id: 'bundle-1', item_junction_quantity: 2 },
        { bundle_id: 'bundle-1', item_junction_quantity: 3 },
        { bundle_id: 'bundle-2', item_junction_quantity: 1 },
      ]);

      await expect(repository.getAllWithSales(['bundle-1', 'bundle-2', 'bundle-3'])).resolves.toEqual({
        'bundle-1': 5,
        'bundle-2': 1,
        'bundle-3': 0,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item_junction.order_id IS NOT NULL');
    });
  });

  describe('remove', () => {
    it('should return null if junction does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(repository.remove('junction-1')).resolves.toBeNull();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
