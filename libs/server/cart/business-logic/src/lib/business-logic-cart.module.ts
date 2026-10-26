import { Module } from "@nestjs/common";
import { DataAccessCartModule } from '@paris-2024/server-data-access-cart';
import { CartService } from "./cart.service";
import { DataAccessItemJunctionModule } from "@paris-2024/server-data-access-item-junction";
import { DataAccessBundleModule } from "@paris-2024/server-data-access-bundle";

@Module({
	imports: [
		DataAccessCartModule,
		DataAccessItemJunctionModule, 
		DataAccessBundleModule,
	],
	providers: [CartService],
	exports: [CartService],
})
export class BusinessLogicCartModule {}
