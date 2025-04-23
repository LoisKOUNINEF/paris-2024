import { Module } from "@nestjs/common";
import { BusinessLogicTicketModule } from '@paris-2024/server-business-logic-ticket';
import { TicketController } from "./ticket.controller";

@Module({
	imports: [
		BusinessLogicTicketModule, 
	],
	controllers: [TicketController],
})
export class PresentationTicketModule {}

