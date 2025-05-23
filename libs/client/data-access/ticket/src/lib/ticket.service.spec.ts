import { TestBed } from '@angular/core/testing';
import { TicketService } from './ticket.service';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { of } from 'rxjs';
import { Ticket } from './ticket.model';

describe('TicketService', () => {
  let service: TicketService;
  let apiRequestService: jest.Mocked<ApiRequestService>;

  beforeEach(() => {
    const apiRequestServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        TicketService,
        { provide: ApiRequestService, useValue: apiRequestServiceMock }
      ]
    });

    service = TestBed.inject(TicketService);
    apiRequestService = TestBed.inject(ApiRequestService) as jest.Mocked<ApiRequestService>;
  });

  it('should call checkValidity with correct QR code', () => {
    const qrCode = 'QR123456';
    const mockTicket: Ticket = { isValid: true } as Ticket;
    apiRequestService.get.mockReturnValue(of(mockTicket));

    service.checkValidity(qrCode).subscribe(response => {
      expect(response).toEqual(mockTicket);
    });

    expect(apiRequestService.get).toHaveBeenCalledWith(`/tickets/${qrCode}`);
  });
});
