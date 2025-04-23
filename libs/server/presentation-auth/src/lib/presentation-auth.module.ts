import { Module } from "@nestjs/common";
import { BusinessLogicAuthModule } from '@paris-2024/server-business-logic-auth';
import { BusinessLogicUserModule } from "@paris-2024/server-business-logic-user";
import { AuthController } from "./auth.controller";
import { BusinessLogicCartModule } from "@paris-2024/server-presentation-auth";

@Module({
	imports: [
		BusinessLogicAuthModule, 
		BusinessLogicUserModule,
		BusinessLogicCartModule,
	],
	controllers: [AuthController],
})
export class PresentationAuthModule {}