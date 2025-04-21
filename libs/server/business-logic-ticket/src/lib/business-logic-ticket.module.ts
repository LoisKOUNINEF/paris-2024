import { Module } from "@nestjs/common";
import { DataAccessTicketModule } from '@paris-2024/server-data-access-ticket';
import { TicketService } from "./ticket.service";

@Module({
	imports: [
		DataAccessTicketModule, 
	],
	providers: [TicketService],
	exports: [TicketService],
})
export class BusinessLogicTicketModule {}
