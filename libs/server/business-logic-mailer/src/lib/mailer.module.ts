import { Module } from '@nestjs/common';
import { UserMailerModule } from './user-mailer/user-mailer.module';

@Module({
  imports: [
    UserMailerModule,
  ],
  exports: [
    UserMailerModule,
  ],
})
export class MailerModule {}
