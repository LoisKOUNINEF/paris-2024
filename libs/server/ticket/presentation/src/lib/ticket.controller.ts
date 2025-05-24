import { Controller, Get, Param } from "@nestjs/common";
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TicketService } from "@paris-2024/server-business-logic-ticket";
import { Admin, Staff } from '@paris-2024/server-business-logic-guards';
import { Ticket } from "@paris-2024/server-data-access-ticket";
import { TicketValidity } from "@paris-2024/shared-interfaces";

@ApiTags('tickets')
@ApiInternalServerErrorResponse()
@Controller('tickets')
export class TicketController {
	constructor(private ticketService: TicketService) {}

	@Get()
	@Admin(true)
	@ApiOkResponse({
		type: Ticket,
		isArray: true,
		description: 'returns all tickets'
	})
	getAll(): Promise<Array<Ticket>> {
		return this.ticketService.getAllTickets();
	}

	@Get(':qrCode')
	@Staff(true)
	@ApiOkResponse({
		description: 'returns ticket validity and user\'s full name.'
	})
	@ApiNotFoundResponse()
	getOneById(@Param('qrCode') qrCode: Ticket['qrCode']): Promise<TicketValidity | null> {
		return this.ticketService.isValid(qrCode);
	}
}