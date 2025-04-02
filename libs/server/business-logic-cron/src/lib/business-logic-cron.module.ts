import { Module } from '@nestjs/common';
import { UserDeletionService } from './user-deletion/user-deletion.service';
import { SendReminderService } from './user-deletion/send-reminder.service';
import { MailerModule } from '@paris-2024/server-business-logic-mailer';
import { DataAccessUserModule } from '@paris-2024/server-data-access-user';

@Module({
  imports: [
    MailerModule,
    DataAccessUserModule,
  ],
  providers: [
    UserDeletionService,
    SendReminderService,
  ]
})
export class BusinessLogicCronModule {}