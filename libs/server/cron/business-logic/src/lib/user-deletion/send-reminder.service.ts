import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AnonymizeMailerService, InactiveUsersMailerService } from '@paris-2024/server-business-logic-mailer';
import { User } from '@paris-2024/server-data-access-user';
import { subDays, subWeeks, subYears } from 'date-fns';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class SendReminderService {
  private readonly logger = new Logger(SendReminderService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly anonymizeMailerService: AnonymizeMailerService,
    private readonly inactiveUsersMailerService: InactiveUsersMailerService,
  ) {}

  @Cron(
    CronExpression.EVERY_DAY_AT_MIDNIGHT, 
    { name: 'send-reminder-before-anonymization' }
  )
  async sendReminderBeforeAnonymization() {
    const thresholdDate = subDays(new Date(), 1);

    const usersToSendReminderTo: Array<User> = await this.userRepository.find({
      where: {
        deletedAt: LessThan(thresholdDate),
        isAnonymized: false,
      },
    });

    if (usersToSendReminderTo.length === 0) {
      this.logger.log('No users to send reminder to.');
      return;
    }

    for (const user of usersToSendReminderTo) {
      await this.anonymizeMailerService.sendReminder(user.email);
      this.logger.log(`Sending email 24 hours before definitive account deletion to ${user.id}`);
    }
  }

  @Cron(
    CronExpression.EVERY_DAY_AT_MIDNIGHT, 
    { name: 'send-reminder-to-inactive-users' }
  )
  async sendReminderToInactiveUsers() {
    const thresholdDate = subWeeks(subYears(new Date(), 2), 1);

    const usersToSendReminderTo: Array<User> = await this.userRepository.find({
      where: {
        lastLoginAt: LessThan(thresholdDate),
        deletedAt: undefined,
      },
    });

    if (usersToSendReminderTo.length === 0) {
      this.logger.log('No users to send reminder to.');
      return;
    }

    for (const user of usersToSendReminderTo) {
      await this.inactiveUsersMailerService.sendReminder(user.email);
      this.logger.log(`Sending email to inactive user ${user.id}`);
    }
  }
}