import { Component, OnInit } from '@angular/core';
import { Ticket, TicketService } from '@paris-2024/client-data-access-ticket';
import { ActivatedRoute } from '@angular/router';
import { PlatformService } from '@paris-2024/client-utils';

@Component({
  selector: 'lib-validate-ticket',
  standalone: true,
  templateUrl: './validate-ticket.component.html',
  styleUrl: './validate-ticket.component.scss',
})
export class ValidateTicketComponent implements OnInit {
  ticket: Ticket;
  constructor(
    private ticketService: TicketService,
    private route: ActivatedRoute,
    private platformService: PlatformService,
  ) {}

  ngOnInit(): void {
    if(this.platformService.isBrowser) {
      const qrCode = this.route.snapshot.paramMap.get('qrCode');
      if (qrCode) {
        this.ticketService.checkValidity(qrCode).subscribe(
          (ticket) => this.ticket = ticket
        );
      }
    } 
  }
}
