import { Injectable } from '@angular/core';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { Observable } from 'rxjs';
import { Ticket } from './ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly ticketUrl: string = '/tickets';

  constructor(private apiRequestService: ApiRequestService) { }

  checkValidity(qrCode: string): Observable<Ticket> {
    return this.apiRequestService.get<Ticket>(`${this.ticketUrl}/${qrCode}`);
  }
}
