import { BadRequestException, ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { OnOrderMailerService } from '@paris-2024/server-business-logic-mailer';
import { StripeService } from '@paris-2024/server-business-logic-stripe';
import { TicketService } from '@paris-2024/server-business-logic-ticket';
import { UserService } from '@paris-2024/server-business-logic-user';
import { ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';
import { OrderRepository } from '@paris-2024/server-data-access-order';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { DataSource, QueryFailedError } from 'typeorm';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let errorSpy: jest.SpyInstance;

  const mockOrderRepository = {
    findOneById: jest.fn(),
    findByUserId: jest.fn(),
    findByPaymentIntentId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockCartService = {
    getCartWithBundles: jest.fn(),
  };

  const mockTicketService = {
    prepareTickets: jest.fn(),
    saveTickets: jest.fn(),
  };

  const mockJunctionRepository = {
    getManyByRelationshipId: jest.fn(),
    switchRelationship: jest.fn(),
  };

  const mockOnOrderMailer = {
    sendTickets: jest.fn(),
  };

  const mockUserService = {
    getUserWithSecret: jest.fn(),
  };

  const mockStripeService = {
    createPaymentIntent: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    refund: jest.fn(),
  };

  const mockManager = { name: 'transaction-manager' };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    secretKey: 'user-secret',
  };


  // total: 3 * 50 + 2 * 150 = 450 cents, tickets: 3 * 1 + 2 * 4 = 11
  const mockJunctions: Array<IItemJunctionModel> = [
    { junction: 'junction-1', id: 'bundle-1', name: 'Solo', amount: 1, price: 50, quantity: 3 },
    { junction: 'junction-2', id: 'bundle-2', name: 'Family', amount: 4, price: 150, quantity: 2 },
  ];

  const cartWith = (bundles: Array<IItemJunctionModel>) => ({ id: 'cart-1', userId: 'user-1', bundles });

  const mockOrder = { id: 'order-1', userId: 'user-1', totalPrice: 450, paymentIntentId: 'pi_1' };

  const succeededPayment = {
    id: 'pi_1',
    status: 'succeeded',
    currency: 'eur',
    amount_received: 450,
    metadata: { userId: 'user-1', cartId: 'cart-1' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: CartService, useValue: mockCartService },
        { provide: TicketService, useValue: mockTicketService },
        { provide: ItemJunctionRepository, useValue: mockJunctionRepository },
        { provide: OnOrderMailerService, useValue: mockOnOrderMailer },
        { provide: UserService, useValue: mockUserService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: StripeService, useValue: mockStripeService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);

    mockCartService.getCartWithBundles.mockResolvedValue(cartWith(mockJunctions));
    mockUserService.getUserWithSecret.mockResolvedValue(mockUser);
    mockOrderRepository.findByPaymentIntentId.mockResolvedValue(null);
    mockOrderRepository.create.mockResolvedValue(mockOrder);
    mockStripeService.retrievePaymentIntent.mockResolvedValue(succeededPayment);
    mockStripeService.createPaymentIntent.mockResolvedValue({ clientSecret: 'pi_1_secret' });
    mockDataSource.transaction.mockImplementation(async (work) => work(mockManager));
    mockJunctionRepository.switchRelationship.mockImplementation(async (ids: Array<string>) =>
      ids.map((id) => ({ id })),
    );
    mockTicketService.prepareTickets.mockImplementation(async (_dto, amount: number) =>
      Array.from({ length: amount }, (_, i) => ({ qrCode: `qr-${i + 1}` })),
    );
    mockTicketService.saveTickets.mockImplementation(async (tickets: Array<object>, orderId: string) =>
      tickets.map((ticket) => ({ ...ticket, orderId })),
    );
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('preparePayment', () => {
    it('should create a payment intent for the cart total, in euros', async () => {
      await expect(service.preparePayment('user-1')).resolves.toEqual({
        clientSecret: 'pi_1_secret',
        amount: 450,
      });
      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(
        450,
        'eur',
        { userId: 'user-1', cartId: 'cart-1' },
      );
    });

    it('should throw if cart is empty', async () => {
      mockCartService.getCartWithBundles.mockResolvedValue(cartWith([]));

      await expect(service.preparePayment('user-1')).rejects.toThrow(BadRequestException);
      expect(mockStripeService.createPaymentIntent).not.toHaveBeenCalled();
    });

    it('should throw if user has no cart', async () => {
      mockCartService.getCartWithBundles.mockResolvedValue(null);

      await expect(service.preparePayment('user-1')).rejects.toThrow(NotFoundException);
      expect(mockStripeService.createPaymentIntent).not.toHaveBeenCalled();
    });

    it('should throw if stripe returns no client secret', async () => {
      mockStripeService.createPaymentIntent.mockResolvedValue({ clientSecret: null });

      await expect(service.preparePayment('user-1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    describe('payment verification', () => {
      it('should verify the payment intent with stripe', async () => {
        await service.create('user-1', 'pi_1');

        expect(mockStripeService.retrievePaymentIntent).toHaveBeenCalledWith('pi_1');
      });

      it('should reject an unknown payment intent', async () => {
        mockStripeService.retrievePaymentIntent.mockRejectedValue(new Error('Error retrieving payment intent'));

        await expect(service.create('user-1', 'pi_unknown')).rejects.toThrow(BadRequestException);
        expect(mockDataSource.transaction).not.toHaveBeenCalled();
      });

      it.each([
        ['not succeeded', { status: 'requires_payment_method' }],
        ['made by another user', { metadata: { userId: 'other-user', cartId: 'cart-2' } }],
        ['without owner', { metadata: {} }],
        ['in another currency', { currency: 'usd' }],
      ])('should reject a payment %s', async (_case, override) => {
        mockStripeService.retrievePaymentIntent.mockResolvedValue({ ...succeededPayment, ...override });

        await expect(service.create('user-1', 'pi_1')).rejects.toThrow(BadRequestException);
        expect(mockDataSource.transaction).not.toHaveBeenCalled();
        expect(mockStripeService.refund).not.toHaveBeenCalled();
      });

      it('should refund and reject when paid amount differs from cart total', async () => {
        mockStripeService.retrievePaymentIntent.mockResolvedValue({ ...succeededPayment, amount_received: 1 });

        await expect(service.create('user-1', 'pi_1')).rejects.toThrow(ConflictException);
        expect(mockStripeService.refund).toHaveBeenCalledWith('pi_1');
        expect(mockDataSource.transaction).not.toHaveBeenCalled();
      });

      it('should refund and reject when cart was emptied after payment', async () => {
        mockCartService.getCartWithBundles.mockResolvedValue(cartWith([]));

        await expect(service.create('user-1', 'pi_1')).rejects.toThrow(ConflictException);
        expect(mockStripeService.refund).toHaveBeenCalledWith('pi_1');
        expect(mockDataSource.transaction).not.toHaveBeenCalled();
      });

      it('should still reject when the refund fails, and log it', async () => {
        mockStripeService.retrievePaymentIntent.mockResolvedValue({ ...succeededPayment, amount_received: 1 });
        mockStripeService.refund.mockRejectedValue(new Error('Error refunding payment intent'));

        await expect(service.create('user-1', 'pi_1')).rejects.toThrow(ConflictException);
        expect(errorSpy).toHaveBeenCalled();
      });

      it('should return the existing order when the same payment is submitted again', async () => {
        mockOrderRepository.findByPaymentIntentId.mockResolvedValue(mockOrder);

        await expect(service.create('user-1', 'pi_1')).resolves.toBe(mockOrder);
        expect(mockStripeService.retrievePaymentIntent).not.toHaveBeenCalled();
        expect(mockDataSource.transaction).not.toHaveBeenCalled();
        expect(mockOnOrderMailer.sendTickets).not.toHaveBeenCalled();
      });

      it('should not return the order of another user for a known payment', async () => {
        mockOrderRepository.findByPaymentIntentId.mockResolvedValue({ ...mockOrder, userId: 'other-user' });

        await expect(service.create('user-1', 'pi_1')).rejects.toThrow(BadRequestException);
      });
    });

    it('should throw if user has no cart', async () => {
      mockCartService.getCartWithBundles.mockResolvedValue(null);

      await expect(service.create('user-1', 'pi_1')).rejects.toThrow(NotFoundException);
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });

    it('should throw if user is not found', async () => {
      mockUserService.getUserWithSecret.mockResolvedValue(undefined);

      await expect(service.create('user-1', 'pi_1')).rejects.toThrow(NotFoundException);
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
    });

    it('should read junctions of the user cart only once', async () => {
      await service.create('user-1', 'pi_1');

      expect(mockCartService.getCartWithBundles).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockJunctionRepository.getManyByRelationshipId).not.toHaveBeenCalled();
    });

    it('should create order with cart total and payment intent', async () => {
      await service.create('user-1', 'pi_1');

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        { userId: 'user-1', totalPrice: 450, paymentIntentId: 'pi_1' },
        mockManager,
      );
    });

    it('should move cart junctions to the new order', async () => {
      await service.create('user-1', 'pi_1');

      expect(mockJunctionRepository.switchRelationship).toHaveBeenCalledWith(
        ['junction-1', 'junction-2'],
        'order-1',
        mockManager,
      );
    });

    it('should create one ticket per seat with user secret', async () => {
      await service.create('user-1', 'pi_1');

      expect(mockTicketService.prepareTickets).toHaveBeenCalledWith(
        { userId: 'user-1', userSecret: 'user-secret' },
        11,
      );
      const [savedTickets, orderId] = mockTicketService.saveTickets.mock.calls[0];
      expect(savedTickets).toHaveLength(11);
      expect(orderId).toBe('order-1');
    });

    it('should generate qr codes before opening the transaction', async () => {
      await service.create('user-1', 'pi_1');

      expect(mockTicketService.prepareTickets.mock.invocationCallOrder[0])
        .toBeLessThan(mockDataSource.transaction.mock.invocationCallOrder[0]);
    });

    it('should send tickets by email and return the order', async () => {
      mockCartService.getCartWithBundles.mockResolvedValue(cartWith([mockJunctions[0]]));
      mockStripeService.retrievePaymentIntent.mockResolvedValue({ ...succeededPayment, amount_received: 150 });

      const result = await service.create('user-1', 'pi_1');

      expect(mockOnOrderMailer.sendTickets).toHaveBeenCalledWith({
        qrCodes: ['qr-1', 'qr-2', 'qr-3'],
        orderId: 'order-1',
        email: 'john.doe@example.com',
        firstName: 'John',
      });
      expect(result).toBe(mockOrder);
    });
  });

  describe('create transaction', () => {
    it('should write order, junctions and tickets in one transaction', async () => {
      await service.create('user-1', 'pi_1');

      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockOrderRepository.create).toHaveBeenCalledWith(expect.anything(), mockManager);
      expect(mockJunctionRepository.switchRelationship).toHaveBeenCalledWith(expect.anything(), 'order-1', mockManager);
      expect(mockTicketService.saveTickets).toHaveBeenCalledWith(expect.anything(), 'order-1', mockManager);
    });

    it('should fail and not send tickets when a ticket cannot be created', async () => {
      mockTicketService.prepareTickets.mockRejectedValue(new Error('Failed to generate QR code.'));

      await expect(service.create('user-1', 'pi_1')).rejects.toThrow('Failed to generate QR code.');
      expect(mockOnOrderMailer.sendTickets).not.toHaveBeenCalled();
    });

    it('should reject when another order already took the cart items', async () => {
      mockJunctionRepository.switchRelationship.mockResolvedValue([{ id: 'junction-1' }]);

      await expect(service.create('user-1', 'pi_1')).rejects.toThrow(ConflictException);
      expect(mockTicketService.saveTickets).not.toHaveBeenCalled();
      expect(mockOnOrderMailer.sendTickets).not.toHaveBeenCalled();
    });

    it('should refund the payment when another order already took the cart items', async () => {
      mockJunctionRepository.switchRelationship.mockResolvedValue([{ id: 'junction-1' }]);

      await expect(service.create('user-1', 'pi_1')).rejects.toThrow(ConflictException);
      expect(mockStripeService.refund).toHaveBeenCalledWith('pi_1');
    });

    it('should reject when a concurrent request already used the payment', async () => {
      const uniqueViolation = new QueryFailedError('INSERT INTO "order"', [], { code: '23505' } as unknown as Error);
      mockDataSource.transaction.mockRejectedValue(uniqueViolation);

      await expect(service.create('user-1', 'pi_1')).rejects.toThrow(ConflictException);
      expect(mockOnOrderMailer.sendTickets).not.toHaveBeenCalled();
      // the payment belongs to the order created by the concurrent request
      expect(mockStripeService.refund).not.toHaveBeenCalled();
    });

    it('should send tickets only once the transaction is committed', async () => {
      let committed = false;
      mockDataSource.transaction.mockImplementation(async (work) => {
        const result = await work(mockManager);
        committed = true;
        return result;
      });
      mockOnOrderMailer.sendTickets.mockImplementation(async () => {
        expect(committed).toBe(true);
      });

      await service.create('user-1', 'pi_1');

      expect(mockOnOrderMailer.sendTickets).toHaveBeenCalled();
    });

    it('should return the order even if the tickets email fails', async () => {
      mockOnOrderMailer.sendTickets.mockRejectedValue(new Error('smtp failure'));

      await expect(service.create('user-1', 'pi_1')).resolves.toBe(mockOrder);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('getAllFromUser', () => {
    it('should return orders of user', async () => {
      mockOrderRepository.findByUserId.mockResolvedValue([mockOrder]);

      await expect(service.getAllFromUser('user-1')).resolves.toEqual([mockOrder]);
      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOneById', () => {
    it('should return order with tickets', async () => {
      const orderTickets = { orderId: 'order-1', userId: 'user-1', totalPrice: 450, tickets: [] };
      mockOrderRepository.findOneById.mockResolvedValue(orderTickets);

      await expect(service.findOneById('order-1')).resolves.toBe(orderTickets);
    });
  });
});
