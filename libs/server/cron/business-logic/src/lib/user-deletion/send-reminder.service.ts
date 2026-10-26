import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AnonymizeMailerService, InactiveUsersMailerService } from '@paris-2024/server-business-logic-mailer';
import { User } from '@paris-2024/server-data-access-user';
import { addWeeks, subDays, subYears } from 'date-fns';
import { IsNull, LessThan, Repository } from 'typeorm';

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
    // accounts are anonymized 7 days after deletion, remind one day before
    const thresholdDate = subDays(new Date(), 6);

    const usersToSendReminderTo: Array<User> = await this.userRepository.find({
      where: {
        deletedAt: LessThan(thresholdDate),
        isAnonymized: false,
        anonymizationReminderSentAt: IsNull(),
      },
      // soft-deleted rows are excluded by default
      withDeleted: true,
    });

    if (usersToSendReminderTo.length === 0) {
      this.logger.log('No users to send reminder to.');
      return;
    }

    for (const user of usersToSendReminderTo) {
      try {
        await this.anonymizeMailerService.sendReminder(user.email);
      } catch (error) {
        this.logger.error(`Failed to send anonymization reminder to ${user.id}`, error);
        continue;
      }
      await this.userRepository.update(user.id, { anonymizationReminderSentAt: new Date() });
      this.logger.log(`Sending email 24 hours before definitive account deletion to ${user.id}`);
    }
  }

  @Cron(
    CronExpression.EVERY_DAY_AT_MIDNIGHT, 
    { name: 'send-reminder-to-inactive-users' }
  )
  async sendReminderToInactiveUsers() {
    // accounts are soft deleted after 2 years of inactivity, remind one week before
    const thresholdDate = addWeeks(subYears(new Date(), 2), 1);

    const usersToSendReminderTo: Array<User> = await this.userRepository.find({
      where: {
        lastLoginAt: LessThan(thresholdDate),
        inactivityReminderSentAt: IsNull(),
      },
    });

    if (usersToSendReminderTo.length === 0) {
      this.logger.log('No users to send reminder to.');
      return;
    }

    for (const user of usersToSendReminderTo) {
      try {
        await this.inactiveUsersMailerService.sendReminder(user.email);
      } catch (error) {
        this.logger.error(`Failed to send inactivity reminder to ${user.id}`, error);
        continue;
      }
      await this.userRepository.update(user.id, { inactivityReminderSentAt: new Date() });
      this.logger.log(`Sending email to inactive user ${user.id}`);
    }
  }
}