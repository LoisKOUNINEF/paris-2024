import { Module } from "@nestjs/common";
import { DataAccessCartModule } from '@paris-2024/server-data-access-cart';
import { CartService } from "./cart.service";

@Module({
	imports: [
		DataAccessCartModule, 
	],
	providers: [CartService],
	exports: [CartService],
})
export class BusinessLogicCartModule {}
