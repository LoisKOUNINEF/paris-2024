import { Module } from "@nestjs/common";
import { BusinessLogicPasswordResetModule } from '@paris-2024/server-business-logic-password-reset';
import { PasswordResetController } from "./password-reset.controller";
import { BusinessLogicCronModule } from "@paris-2024/server-business-logic-cron";

@Module({
  imports: [
    BusinessLogicPasswordResetModule, 
    BusinessLogicCronModule,
  ],
  controllers: [PasswordResetController],
})
export class PresentationPasswordResetModule {}