import { Module } from "@nestjs/common";
import { DataAccessUserModule } from '@paris-2024/server-data-access-user';
import { UserService } from "./user.service";
import { MailerModule } from '@paris-2024/server-business-logic-mailer';

@Module({
	imports: [
		DataAccessUserModule, 
		MailerModule,
	],
	providers: [UserService],
	exports: [UserService],
})
export class BusinessLogicUserModule {}
