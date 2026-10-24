import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Ticket, TicketService } from '@paris-2024/client-data-access-ticket';
import { PlatformService } from '@paris-2024/client-utils';
import { ValidateTicketComponent } from './validate-ticket.component';

describe('ValidateTicketComponent', () => {
  let fixture: ComponentFixture<ValidateTicketComponent>;
  let ticketService: jest.Mocked<TicketService>;
  let platformService: { isBrowser: boolean };

  const createComponent = (qrCode: string | null) => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap(qrCode ? { qrCode } : {}) } },
    });
    fixture = TestBed.createComponent(ValidateTicketComponent);
    fixture.detectChanges();
  };

  const text = () => fixture.nativeElement.textContent;

  beforeEach(async () => {
    platformService = { isBrowser: true };
    ticketService = {
      checkValidity: jest.fn(),
    } as unknown as jest.Mocked<TicketService>;

    await TestBed.configureTestingModule({
      imports: [ValidateTicketComponent],
      providers: [
        { provide: TicketService, useValue: ticketService },
        { provide: PlatformService, useValue: platformService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should show a valid ticket with the booking name', () => {
    ticketService.checkValidity.mockReturnValue(
      of({ isValid: true, userFullName: 'Loïs Test' } as unknown as Ticket)
    );
    createComponent('qr-123');

    expect(ticketService.checkValidity).toHaveBeenCalledWith('qr-123');
    expect(text()).toContain('Ticket valide.');
    expect(text()).toContain('Loïs Test');
  });

  it('should reject a ticket that is not valid', () => {
    ticketService.checkValidity.mockReturnValue(
      of({ isValid: false, userFullName: 'Loïs Test' } as unknown as Ticket)
    );
    createComponent('qr-123');

    expect(text()).toContain('Ticket invalide ou inexistant.');
    expect(text()).not.toContain('Loïs Test');
  });

  it('should reject an unknown ticket', () => {
    ticketService.checkValidity.mockReturnValue(of(null as unknown as Ticket));
    createComponent('qr-unknown');

    expect(text()).toContain('Ticket invalide ou inexistant.');
  });

  it('should not check anything without a QR code', () => {
    createComponent(null);

    expect(ticketService.checkValidity).not.toHaveBeenCalled();
    expect(text()).toContain('Ticket invalide ou inexistant.');
  });

  it('should not check the ticket on the server', () => {
    platformService.isBrowser = false;
    createComponent('qr-123');

    expect(ticketService.checkValidity).not.toHaveBeenCalled();
  });
});
