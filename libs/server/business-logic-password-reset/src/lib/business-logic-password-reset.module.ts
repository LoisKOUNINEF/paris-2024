import { Module } from "@nestjs/common";
import { PasswordResetService } from "./password-reset.service";
import { MailerModule } from '@paris-2024/server-business-logic-mailer';
import { DataAccessUserModule } from "@paris-2024/server-data-access-user";
import { DataAccessPasswordResetModule } from "@paris-2024/server-data-access-password-reset";

@Module({
	imports: [
		DataAccessUserModule,
		MailerModule,
		DataAccessPasswordResetModule,
	],
	providers: [PasswordResetService],
	exports: [PasswordResetService],
})
export class BusinessLogicPasswordResetModule {}
