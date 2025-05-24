import { Module } from "@nestjs/common";
import { DataAccessOrderModule } from '@paris-2024/server-data-access-order';
import { BusinessLogicCartModule } from "@paris-2024/server-business-logic-cart";
import { BusinessLogicTicketModule } from '@paris-2024/server-business-logic-ticket';
import { BusinessLogicUserModule } from '@paris-2024/server-business-logic-user';
import { DataAccessItemJunctionModule } from '@paris-2024/server-data-access-item-junction';
import { OrderService } from "./order.service";
import { MailerModule } from '@paris-2024/server-business-logic-mailer';

@Module({
	imports: [
		DataAccessOrderModule,
		BusinessLogicCartModule, 
		BusinessLogicTicketModule,
		DataAccessItemJunctionModule,
		MailerModule,
		BusinessLogicUserModule,
	],
	providers: [OrderService],
	exports: [OrderService],
})
export class BusinessLogicOrderModule {}
