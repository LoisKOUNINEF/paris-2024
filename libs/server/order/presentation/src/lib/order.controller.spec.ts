import { HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '@paris-2024/server-business-logic-order';
import { OWNERSHIP_GUARD_OPTIONS, OwnershipGuardOptions } from '@paris-2024/server-business-logic-guards';
import { RequestWithUser } from '@paris-2024/server-base-entity';
import { NewOrderDto, Order } from '@paris-2024/server-data-access-order';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Roles } from '@paris-2024/shared-interfaces';
import { OrderController } from './order.controller';

describe('OrderController', () => {
  let controller: OrderController;

  const mockOrderService = {
    getAll: jest.fn(),
    getAllFromUser: jest.fn(),
    create: jest.fn(),
    preparePayment: jest.fn(),
  };

  const currentUser = { id: 'user-1', role: Roles.CUSTOMER };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('createPaymentIntent', () => {
    it('should throw if user is not logged in', () => {
      const req = { user: undefined } as RequestWithUser;

      expect(() => controller.createPaymentIntent(req)).toThrow(HttpException);
      expect(mockOrderService.preparePayment).not.toHaveBeenCalled();
    });

    it('should prepare payment of the logged in user cart', async () => {
      const paymentIntent = { clientSecret: 'pi_1_secret', amount: 450 };
      mockOrderService.preparePayment.mockResolvedValue(paymentIntent);
      const req = { user: currentUser } as RequestWithUser;

      await expect(controller.createPaymentIntent(req)).resolves.toBe(paymentIntent);
      expect(mockOrderService.preparePayment).toHaveBeenCalledWith('user-1');
    });
  });

  describe('create', () => {
    const dto = { paymentIntentId: 'pi_1' };

    it('should throw if user is not logged in', () => {
      const req = { user: undefined } as RequestWithUser;

      expect(() => controller.create(req, dto)).toThrow(HttpException);
      expect(mockOrderService.create).not.toHaveBeenCalled();
    });

    it('should create order for logged in user from the confirmed payment', async () => {
      const order = { id: 'order-1' };
      mockOrderService.create.mockResolvedValue(order);
      const req = { user: currentUser } as RequestWithUser;

      await expect(controller.create(req, dto)).resolves.toBe(order);
      expect(mockOrderService.create).toHaveBeenCalledWith('user-1', 'pi_1');
    });
  });

  describe('NewOrderDto validation', () => {
    it.each([
      ['missing', {}],
      ['empty', { paymentIntentId: '' }],
      ['not a string', { paymentIntentId: 42 }],
    ])('should reject a %s payment intent id', async (_case, body) => {
      const errors = await validate(plainToInstance(NewOrderDto, body));

      expect(errors).not.toHaveLength(0);
    });

    it('should accept a payment intent id', async () => {
      const errors = await validate(plainToInstance(NewOrderDto, { paymentIntentId: 'pi_1' }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('getUserOrders', () => {
    it('should throw if user is not logged in', () => {
      expect(() => controller.getUserOrders(undefined)).toThrow(HttpException);
    });

    it('should return orders of current user', async () => {
      mockOrderService.getAllFromUser.mockResolvedValue([]);

      await controller.getUserOrders(currentUser);

      expect(mockOrderService.getAllFromUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getOrder', () => {
    it('should return the entity loaded by the ownership guard', () => {
      const order = { id: 'order-1', userId: 'user-1' } as unknown as Order;

      expect(controller.getOrder(currentUser, order)).toBe(order);
    });
  });

  describe('ownership metadata', () => {
    const reflector = new Reflector();

    it('getOrder should check ownership on userId of fetched order', () => {
      const options = reflector.get<OwnershipGuardOptions>(
        OWNERSHIP_GUARD_OPTIONS,
        OrderController.prototype.getOrder,
      );

      expect(reflector.get('owner', OrderController.prototype.getOrder)).toBe(true);
      expect(options).toEqual(expect.objectContaining({
        paramKey: 'id',
        findMethod: 'findOneById',
        ownershipField: 'userId',
      }));
    });

    it('getAll should be restricted to admins', () => {
      expect(reflector.get('admin', OrderController.prototype.getAll)).toBe(true);
    });
  });
});
