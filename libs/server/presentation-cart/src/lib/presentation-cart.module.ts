import { Module } from "@nestjs/common";
import { BusinessLogicCartModule } from '@paris-2024/server-business-logic-cart';
import { CartController } from "./cart.controller";

@Module({
	imports: [
		BusinessLogicCartModule, 
	],
	controllers: [CartController],
})
export class PresentationCartModule {}
