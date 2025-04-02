import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SendReminderService {
  private readonly logger = new Logger(SendReminderService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendReminderBeforeAnonymization() {
    this.logger.log('Sending email 24 hours before definitive account deletion.');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendReminderToInactiveUsers() {
    this.logger.log('Sending email 7 days before account is softDeleted.');
  }
}