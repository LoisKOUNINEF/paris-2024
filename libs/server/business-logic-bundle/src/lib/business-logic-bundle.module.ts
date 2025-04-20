import { Module } from "@nestjs/common";
import { DataAccessBundleModule } from '@paris-2024/server-data-access-bundle';
import { BundleService } from "./bundle.service";
import { DataAccessItemJunctionModule } from "@paris-2024/server-data-access-item-junction";

@Module({
	imports: [
		DataAccessBundleModule,
		DataAccessItemJunctionModule, 
	],
	providers: [BundleService],
	exports: [BundleService],
})
export class BusinessLogicBundleModule {}
