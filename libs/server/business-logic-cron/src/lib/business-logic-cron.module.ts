import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@paris-2024/server-business-logic-mailer';
import { User } from '@paris-2024/server-data-access-user';
import { UserDeletionService } from './user-deletion/user-deletion.service';
import { SendReminderService } from './user-deletion/send-reminder.service';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';
import { PasswordResetExpirationService } from './token-cleanup/password-reset-expiration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordReset]),
    MailerModule,
  ],
  providers: [
    UserDeletionService,
    SendReminderService,
    PasswordResetExpirationService,
  ],
  exports: [
    PasswordResetExpirationService,
  ]
})
export class BusinessLogicCronModule {}