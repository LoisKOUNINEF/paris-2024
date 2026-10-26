import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as qrCode from 'qrcode';
import { TicketRepository } from '@paris-2024/server-data-access-ticket';
import { hash } from '@paris-2024/server-utils';
import { TicketService } from './ticket.service';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
}));

describe('TicketService', () => {
  let service: TicketService;

  const mockTicketRepository = {
    create: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn(),
    findAllFromUser: jest.fn(),
    findOneById: jest.fn(),
    findValids: jest.fn(),
    isValid: jest.fn(),
  };

  const ticketDto = {
    userId: 'user-1',
    userSecret: 'user-secret',
  };

  const appUrl = 'https://studi-exam-jo.lois-kouninef.eu/staff/ticket-validity';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TicketRepository, useValue: mockTicketRepository },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);

    (qrCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,qr');
    mockTicketRepository.createMany.mockImplementation(async (dtos) => dtos);
  });

  describe('prepareTickets', () => {
    it('should throw if user secret is missing', async () => {
      await expect(service.prepareTickets({ ...ticketDto, userSecret: '' }, 1))
        .rejects.toThrow(BadRequestException);
      expect(qrCode.toDataURL).not.toHaveBeenCalled();
    });

    it('should prepare the requested amount of tickets', async () => {
      await expect(service.prepareTickets(ticketDto, 3)).resolves.toHaveLength(3);
      expect(qrCode.toDataURL).toHaveBeenCalledTimes(3);
    });

    it('should encode validation url with user secret and token in qr code', async () => {
      await service.prepareTickets(ticketDto, 1);

      const qrCodeData = (qrCode.toDataURL as jest.Mock).mock.calls[0][0];
      expect(qrCodeData).toMatch(
        new RegExp(`^${appUrl}/user-secret:[0-9a-f-]{36}$`),
      );
    });

    it('should keep the token hash, never the raw token', async () => {
      const [ticket] = await service.prepareTickets(ticketDto, 1);

      const qrCodeData: string = (qrCode.toDataURL as jest.Mock).mock.calls[0][0];
      const token = qrCodeData.split(':').pop() as string;

      expect(ticket).toEqual({
        ...ticketDto,
        qrCode: 'data:image/png;base64,qr',
        tokenHash: hash(token),
      });
      expect(JSON.stringify(ticket)).not.toContain(token);
    });

    it('should generate a different token for each ticket', async () => {
      const [first, second] = await service.prepareTickets(ticketDto, 2);

      expect(first.tokenHash).not.toEqual(second.tokenHash);
    });

    it('should fail if a qr code cannot be generated', async () => {
      (qrCode.toDataURL as jest.Mock).mockRejectedValue(new Error('qr failure'));

      await expect(service.prepareTickets(ticketDto, 2)).rejects.toThrow('Failed to generate QR code.');
    });
  });

  describe('saveTickets', () => {
    const prepared = [
      { ...ticketDto, qrCode: 'qr-1', tokenHash: 'h1' },
      { ...ticketDto, qrCode: 'qr-2', tokenHash: 'h2' },
    ];

    it('should save all tickets of the order at once', async () => {
      const manager = { name: 'transaction-manager' };

      await service.saveTickets(prepared, 'order-1', manager as never);

      expect(mockTicketRepository.createMany).toHaveBeenCalledTimes(1);
      expect(mockTicketRepository.createMany).toHaveBeenCalledWith(
        prepared.map((ticket) => ({ ...ticket, orderId: 'order-1' })),
        manager,
      );
    });

    it('should not hit the database without tickets', async () => {
      await expect(service.saveTickets([], 'order-1')).resolves.toEqual([]);
      expect(mockTicketRepository.createMany).not.toHaveBeenCalled();
    });
  });

  describe('isValid', () => {
    it('should split qr code and look up ticket with hashed token', async () => {
      const validity = { isValid: true, userFullName: 'John Doe', createdAt: new Date() };
      mockTicketRepository.isValid.mockResolvedValue(validity);

      const result = await service.isValid('user-secret:ticket-token');

      expect(mockTicketRepository.isValid).toHaveBeenCalledWith('user-secret', hash('ticket-token'));
      expect(result).toBe(validity);
    });

    it.each([
      ['without separator', 'user-secret'],
      ['without token', 'user-secret:'],
      ['without secret', ':ticket-token'],
    ])('should reject malformed qr code %s', async (_case, value) => {
      await expect(service.isValid(value)).rejects.toThrow(BadRequestException);
      expect(mockTicketRepository.isValid).not.toHaveBeenCalled();
    });
  });

  describe('getUsersTickets', () => {
    it('should return tickets of user', async () => {
      mockTicketRepository.findAllFromUser.mockResolvedValue([]);

      await service.getUsersTickets('user-1');

      expect(mockTicketRepository.findAllFromUser).toHaveBeenCalledWith('user-1');
    });
  });
});
