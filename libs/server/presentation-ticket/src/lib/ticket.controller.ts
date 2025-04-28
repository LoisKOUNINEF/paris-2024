import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request } from "@nestjs/common";
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TicketService } from "@paris-2024/server-business-logic-ticket";
import { Admin, Staff } from '@paris-2024/server-business-logic-guards';
import { Ticket } from "@paris-2024/server-data-access-ticket";
import { RequestWithUser } from "@paris-2024/server-base-entity";

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

	@Get(':id')
	// @Owner(true)
	@ApiOkResponse({
		type: Ticket,
		description: 'returns a ticket by its ID'
	})
	getOneById(@Param('id') id: Ticket['id']): Promise<Ticket | undefined> {
		return this.ticketService.findOneById(id)
	}

	@Get('tickets')
	// @Owner(true)
	@ApiOkResponse({
		type: Ticket,
		description: 'returns all of logged in user\'s ticket'
	})
	getAllFromUser(@Request() req: RequestWithUser): Promise<Array<Ticket> | undefined> {
		const userId = req.user?.id;
		if (!userId) {
			throw new HttpException('You must be logged in to gain access to this page.', HttpStatus.BAD_REQUEST)
		}
		return this.ticketService.getUsersTickets(userId);
	}

	@Post()
	@Staff(true)
	@ApiOkResponse({
		type: 'boolean',
		description: 'checks if ticket exists and is valid',
	})
	@ApiNotFoundResponse()
	validateTicket(@Body() qrCode: Ticket['qrCode']): Promise<boolean> {
		return this.ticketService.isValid(qrCode);
	}
}