import { Module } from "@nestjs/common";
import { DataAccessCartModule } from '@paris-2024/server-data-access-cart';
import { CartService } from "./cart.service";
import { DataAccessItemJunctionModule } from "@paris-2024/server-data-access-item-junction";

@Module({
	imports: [
		DataAccessCartModule,
		DataAccessItemJunctionModule, 
	],
	providers: [CartService],
	exports: [CartService],
})
export class BusinessLogicCartModule {}
