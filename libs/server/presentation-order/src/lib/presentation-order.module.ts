import { Module } from "@nestjs/common";
import { BusinessLogicOrderModule } from '@paris-2024/server-business-logic-order';
import { OrderController } from "./order.controller";

@Module({
	imports: [
		BusinessLogicOrderModule, 
	],
	controllers: [OrderController],
})
export class PresentationOrderModule {}
