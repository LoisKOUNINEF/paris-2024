import { Module } from "@nestjs/common";
import { BusinessLogicAuthModule } from '@paris-2024/server-business-logic-auth';
import { BusinessLogicUserModule } from "@paris-2024/server-business-logic-user";
import { AuthController } from "./auth.controller";

@Module({
	imports: [
		BusinessLogicAuthModule, 
		BusinessLogicUserModule,
	],
	controllers: [AuthController],
})
export class PresentationAuthModule {}