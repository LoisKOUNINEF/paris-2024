import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from '@paris-2024/server-business-logic-ticket';
import { TicketController } from './ticket.controller';

describe('TicketController', () => {
  let controller: TicketController;

  const mockTicketService = {
    getAllTickets: jest.fn(),
    isValid: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        { provide: TicketService, useValue: mockTicketService },
      ],
    }).compile();

    controller = module.get<TicketController>(TicketController);
  });

  it('should check validity of scanned qr code', async () => {
    const validity = { isValid: true, userFullName: 'John Doe', createdAt: new Date() };
    mockTicketService.isValid.mockResolvedValue(validity);

    await expect(controller.getOneById('user-secret:token')).resolves.toBe(validity);
    expect(mockTicketService.isValid).toHaveBeenCalledWith('user-secret:token');
  });

  describe('access metadata', () => {
    const reflector = new Reflector();

    it('getOneById should be restricted to staff', () => {
      expect(reflector.get('staff', TicketController.prototype.getOneById)).toBe(true);
    });

    it('getAll should be restricted to admins', () => {
      expect(reflector.get('admin', TicketController.prototype.getAll)).toBe(true);
    });
  });
});
