import { Module } from "@nestjs/common";
import { BusinessLogicBundleModule } from '@paris-2024/server-business-logic-bundle';
import { BundleController } from "./bundle.controller";

@Module({
	imports: [
		BusinessLogicBundleModule, 
	],
	controllers: [BundleController],
})
export class PresentationBundleModule {}
