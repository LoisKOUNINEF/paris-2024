import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';
import { subHours } from 'date-fns';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class PasswordResetExpirationService {
  private readonly logger = new Logger(PasswordResetExpirationService.name);

  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
  ) {}

  @Cron(
    CronExpression.EVERY_HOUR,
    { name: 'delete-old-pwd-reset-tokens' }
  )
  async deleteExpiredTokens() {
    const treshold = subHours(new Date(), 1);

    const expired: Array<PasswordReset> = await this.passwordResetRepository.find({
      where: { createdAt: LessThan(treshold) },
    });

    if (expired.length === 0) {
      this.logger.log('No tokens to remove.');
      return;
    }

    await this.passwordResetRepository.remove(expired);
    this.logger.log('Old tokens have been removed.');
  }
}