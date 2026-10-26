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
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    whereInIds: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getMany: jest.fn(),
    execute: jest.fn(),
  };

  const mockTransactionRepository = {
    delete: jest.fn(),
  };

  const mockTransactionManager = {
    query: jest.fn(),
    getRepository: jest.fn(() => mockTransactionRepository),
  };

  const mockManager = {
    transaction: jest.fn(async (work: (manager: unknown) => Promise<unknown>) => work(mockTransactionManager)),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    query: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    manager: mockManager,
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

    it('should only list bundles that can still be bought in a cart', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await repository.getManyByRelationshipId('cart', 'cart-1');

      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'bundle',
        'b',
        'item_junction.bundle_id::uuid = b.id AND b.deleted_at IS NULL AND b.is_available = true',
      );
    });

    it('should keep deleted or unavailable bundles in an order', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await repository.getManyByRelationshipId('order', 'order-1');

      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('bundle', 'b', 'item_junction.bundle_id::uuid = b.id');
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
    it('should upsert cart lines in one statement, adding quantities', async () => {
      const saved = { id: 'junction-1', cartId: 'cart-1', bundleId: 'bundle-1', quantity: 5 };
      mockRepository.findOne.mockResolvedValue(saved);

      const result = await repository.create({ cartId: 'cart-1', bundleId: 'bundle-1', quantity: 3 });

      const [sql, params] = mockRepository.query.mock.calls[0];
      expect(sql).toContain('ON CONFLICT ("cart_id", "bundle_id")');
      expect(sql).toContain('"quantity" = "item_junction"."quantity" + EXCLUDED."quantity"');
      expect(params).toEqual(['cart-1', 'bundle-1', 3]);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBe(saved);
    });

    it('should insert junctions without cart directly', async () => {
      const dto = { orderId: 'order-1', bundleId: 'bundle-1', quantity: 3 };

      await repository.create(dto);

      expect(mockRepository.query).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity without reading the junction again', async () => {
      const result = await repository.updateQuantity({ id: 'junction-1', quantity: 1 } as ItemJunction, 3);

      expect(mockRepository.update).toHaveBeenCalledWith('junction-1', { quantity: 3 });
      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'junction-1', quantity: 3 });
    });

    it('should remove junction when quantity is 0', async () => {
      await repository.updateQuantity({ id: 'junction-1', quantity: 1 } as ItemJunction, 0);

      expect(mockRepository.delete).toHaveBeenCalledWith('junction-1');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('mergeJunctions', () => {
    it('should move guest lines into the user cart and delete them in one transaction', async () => {
      await repository.mergeJunctions('user-cart', 'guest-cart');

      expect(mockManager.transaction).toHaveBeenCalledTimes(1);
      const [sql, params] = mockTransactionManager.query.mock.calls[0];
      expect(sql).toContain('SELECT $1::uuid, "bundle_id", "quantity" FROM "item_junction" WHERE "cart_id" = $2::uuid');
      expect(sql).toContain('ON CONFLICT ("cart_id", "bundle_id")');
      expect(params).toEqual(['user-cart', 'guest-cart']);
      expect(mockTransactionRepository.delete).toHaveBeenCalledWith({ cartId: 'guest-cart' });
    });

    it('should not delete guest lines if moving them failed', async () => {
      mockTransactionManager.query.mockRejectedValueOnce(new Error('db failure'));

      await expect(repository.mergeJunctions('user-cart', 'guest-cart')).rejects.toThrow('db failure');
      expect(mockTransactionRepository.delete).not.toHaveBeenCalled();
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
    it('should sum quantities of junctions attached to an order in the database', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ sales: '5' });

      await expect(repository.getOneWithSales('bundle-1')).resolves.toBe(5);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('COALESCE(SUM(item_junction.quantity), 0)', 'sales');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item_junction.order_id IS NOT NULL');
    });
  });

  describe('getAllWithSales', () => {
    it('should not query without bundle ids', async () => {
      await expect(repository.getAllWithSales([])).resolves.toEqual({});
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should group sales per bundle and default unsold bundles to 0', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { bundleId: 'bundle-1', sales: '5' },
        { bundleId: 'bundle-2', sales: '1' },
      ]);

      await expect(repository.getAllWithSales(['bundle-1', 'bundle-2', 'bundle-3'])).resolves.toEqual({
        'bundle-1': 5,
        'bundle-2': 1,
        'bundle-3': 0,
      });
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('item_junction.bundle_id');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('item_junction.order_id IS NOT NULL');
    });
  });

  describe('remove', () => {
    it('should return null if junction does not exist', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(repository.remove('junction-1')).resolves.toBeNull();
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should delete junction', async () => {
      const deleteResult = { affected: 1, raw: [] };
      mockRepository.delete.mockResolvedValue(deleteResult);

      await expect(repository.remove('junction-1')).resolves.toBe(deleteResult);
      expect(mockRepository.delete).toHaveBeenCalledWith('junction-1');
    });
  });
});
