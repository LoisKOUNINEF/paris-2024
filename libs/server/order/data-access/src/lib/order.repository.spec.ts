import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderRepository } from './order.repository';
import { Order } from './order.entity';
import { EntityManager } from 'typeorm';

describe('OrderRepository', () => {
  let orderRepository: OrderRepository;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        { provide: getRepositoryToken(Order), useValue: mockRepository },
      ],
    }).compile();

    orderRepository = module.get<OrderRepository>(OrderRepository);
  });

  describe('findOneById', () => {
    it('should return null if order does not exist', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(undefined);

      await expect(orderRepository.findOneById('order-1')).resolves.toBeNull();
    });

    it('should map raw result and cast total price to number', async () => {
      const tickets = [{ id: 'ticket-1', qrCode: 'qr' }];
      mockQueryBuilder.getRawOne.mockResolvedValue({
        orderId: 'order-1',
        totalPrice: '450.00',
        userId: 'user-1',
        tickets,
      });

      const result = await orderRepository.findOneById('order-1');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('order.id = :id::uuid', { id: 'order-1' });
      expect(result).toEqual({
        orderId: 'order-1',
        totalPrice: 450,
        userId: 'user-1',
        tickets,
      });
    });
  });

  describe('findByPaymentIntentId', () => {
    it('should look up the order paid by the payment intent', async () => {
      const order = { id: 'order-1', paymentIntentId: 'pi_1' };
      mockRepository.findOne.mockResolvedValue(order);

      await expect(orderRepository.findByPaymentIntentId('pi_1')).resolves.toBe(order);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { paymentIntentId: 'pi_1' } });
    });
  });

  describe('findByUserId', () => {
    it('should filter orders by user id', async () => {
      mockRepository.find.mockResolvedValue([]);

      await orderRepository.findByUserId('user-1');

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });

  describe('create', () => {
    it('should create and save order', async () => {
      const dto = { userId: 'user-1', totalPrice: 450 };
      const order = { id: 'order-1', ...dto };
      mockRepository.create.mockReturnValue(order);
      mockRepository.save.mockResolvedValue(order);

      await expect(orderRepository.create(dto)).resolves.toBe(order);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should save through the transaction manager when given', async () => {
      const dto = { userId: 'user-1', totalPrice: 450 };
      const transactionRepository = { create: jest.fn((value) => value), save: jest.fn(async (value) => value) };
      const manager = { getRepository: jest.fn(() => transactionRepository) };

      await orderRepository.create(dto, manager as unknown as EntityManager);

      expect(manager.getRepository).toHaveBeenCalledWith(Order);
      expect(transactionRepository.save).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
