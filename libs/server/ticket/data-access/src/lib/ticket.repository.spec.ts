import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TicketRepository } from './ticket.repository';
import { Ticket } from './ticket.entity';
import { EntityManager } from 'typeorm';

describe('TicketRepository', () => {
  let ticketRepository: TicketRepository;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketRepository,
        { provide: getRepositoryToken(Ticket), useValue: mockRepository },
      ],
    }).compile();

    ticketRepository = module.get<TicketRepository>(TicketRepository);
  });

  describe('findOneById', () => {
    it('should return ticket', async () => {
      const ticket = { id: 'ticket-1' };
      mockRepository.findOne.mockResolvedValue(ticket);

      await expect(ticketRepository.findOneById('ticket-1')).resolves.toBe(ticket);
    });

    it('should throw if ticket does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(ticketRepository.findOneById('ticket-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('isValid', () => {
    it('should match both token hash and user secret', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        isValid: true,
        createdAt: new Date('2024-07-26'),
        firstName: 'John',
        lastName: 'Doe',
      });

      await ticketRepository.isValid('user-secret', 'token-hash');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ticket.token_hash = :tokenHash', { tokenHash: 'token-hash' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.secret_key = :userSecret', { userSecret: 'user-secret' });
    });

    it('should return validity with user full name', async () => {
      const createdAt = new Date('2024-07-26');
      mockQueryBuilder.getRawOne.mockResolvedValue({
        isValid: false,
        createdAt,
        firstName: 'John',
        lastName: 'Doe',
      });

      await expect(ticketRepository.isValid('user-secret', 'token-hash')).resolves.toEqual({
        isValid: false,
        userFullName: 'John Doe',
        createdAt,
      });
    });

    it('should throw if no ticket matches', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(undefined);

      await expect(ticketRepository.isValid('user-secret', 'token-hash')).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should create and save ticket', async () => {
      const dto = { userId: 'user-1', orderId: 'order-1', userSecret: 's', tokenHash: 'h', qrCode: 'qr' };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 'ticket-1', ...dto });

      await expect(ticketRepository.create(dto)).resolves.toEqual({ id: 'ticket-1', ...dto });
      expect(mockRepository.save).toHaveBeenCalledWith(dto);
    });

    it('should save through the transaction manager when given', async () => {
      const dto = { userId: 'user-1', orderId: 'order-1', userSecret: 's', tokenHash: 'h', qrCode: 'qr' };
      const transactionRepository = { create: jest.fn((value) => value), save: jest.fn(async (value) => value) };
      const manager = { getRepository: jest.fn(() => transactionRepository) };

      await ticketRepository.create(dto, manager as unknown as EntityManager);

      expect(manager.getRepository).toHaveBeenCalledWith(Ticket);
      expect(transactionRepository.save).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    it('should save all tickets in one call through the transaction manager', async () => {
      const dtos = [
        { userId: 'user-1', orderId: 'order-1', userSecret: 's', tokenHash: 'h1', qrCode: 'qr-1' },
        { userId: 'user-1', orderId: 'order-1', userSecret: 's', tokenHash: 'h2', qrCode: 'qr-2' },
      ];
      const transactionRepository = { create: jest.fn((value) => value), save: jest.fn(async (value) => value) };
      const manager = { getRepository: jest.fn(() => transactionRepository) };

      await ticketRepository.createMany(dtos, manager as unknown as EntityManager);

      expect(transactionRepository.save).toHaveBeenCalledTimes(1);
      expect(transactionRepository.save).toHaveBeenCalledWith(dtos);
    });
  });
});
