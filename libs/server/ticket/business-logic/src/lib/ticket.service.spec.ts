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
    findAll: jest.fn(),
    findAllFromUser: jest.fn(),
    findOneById: jest.fn(),
    findValids: jest.fn(),
    isValid: jest.fn(),
  };

  const ticketDto = {
    userId: 'user-1',
    orderId: 'order-1',
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
    mockTicketRepository.create.mockImplementation(async (dto) => ({ id: 'ticket-1', ...dto }));
  });

  describe('createTicket', () => {
    it('should throw if user secret is missing', async () => {
      await expect(service.createTicket({ ...ticketDto, userSecret: '' }))
        .rejects.toThrow(BadRequestException);
      expect(qrCode.toDataURL).not.toHaveBeenCalled();
      expect(mockTicketRepository.create).not.toHaveBeenCalled();
    });

    it('should encode validation url with user secret and token in qr code', async () => {
      await service.createTicket(ticketDto);

      const qrCodeData = (qrCode.toDataURL as jest.Mock).mock.calls[0][0];
      expect(qrCodeData).toMatch(
        new RegExp(`^${appUrl}/user-secret:[0-9a-f-]{36}$`),
      );
    });

    it('should store the token hash, never the raw token', async () => {
      await service.createTicket(ticketDto);

      const qrCodeData: string = (qrCode.toDataURL as jest.Mock).mock.calls[0][0];
      const token = qrCodeData.split(':').pop() as string;
      const savedDto = mockTicketRepository.create.mock.calls[0][0];

      expect(savedDto).toEqual({
        ...ticketDto,
        qrCode: 'data:image/png;base64,qr',
        tokenHash: hash(token),
      });
      expect(JSON.stringify(savedDto)).not.toContain(token);
    });

    it('should pass the transaction manager to the repository', async () => {
      const manager = { name: 'transaction-manager' };

      await service.createTicket(ticketDto, manager as never);

      expect(mockTicketRepository.create).toHaveBeenCalledWith(expect.any(Object), manager);
    });

    it('should generate a different token for each ticket', async () => {
      await service.createTicket(ticketDto);
      await service.createTicket(ticketDto);

      const [first, second] = mockTicketRepository.create.mock.calls.map(([dto]) => dto.tokenHash);
      expect(first).not.toEqual(second);
    });

    it('should not save ticket if qr code generation fails', async () => {
      (qrCode.toDataURL as jest.Mock).mockRejectedValue(new Error('qr failure'));

      await expect(service.createTicket(ticketDto)).rejects.toThrow('Failed to generate QR code.');
      expect(mockTicketRepository.create).not.toHaveBeenCalled();
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
