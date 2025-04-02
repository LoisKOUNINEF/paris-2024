import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { BusinessLogicUserModule } from '@paris-2024/server-business-logic-user';

@Module({
  imports: [BusinessLogicUserModule],
  controllers: [UserController],
  providers: [],
  exports: [],
})
export class PresentationUserModule {}