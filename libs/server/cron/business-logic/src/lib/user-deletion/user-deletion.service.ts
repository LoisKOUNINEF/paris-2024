import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '@paris-2024/server-data-access-user';
import { subDays, subYears } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserDeletionService {
  private readonly logger = new Logger(UserDeletionService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(
    CronExpression.EVERY_DAY_AT_MIDNIGHT,
    { name: 'anonymize-deleted-accounts' }
  )
  async anonymizeDeletedAccounts() {
    const thresholdDate = subDays(new Date(), 7);

    // one statement for every account: soft-deleted rows are not filtered out of updates
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        email: () => `'anon-' || "id" || '@anonymous.com'`,
        firstName: 'Anonymized',
        lastName: 'User',
        pendingEmail: null,
        isAnonymized: true,
      })
      .where('"deleted_at" < :thresholdDate', { thresholdDate })
      .andWhere('"is_anonymized" = false')
      .returning('id')
      .execute();

    this.logUpdatedUsers(result, 'Anonymized user ID', 'No users to anonymize.');
  }

  @Cron(
    CronExpression.EVERY_DAY_AT_MIDNIGHT, 
    { name: 'soft-delete-inative-accounts' }
  )
  async softDeleteInactiveAccounts() {
    const thresholdDate = subYears(new Date(), 2);

    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ deletedAt: () => 'CURRENT_TIMESTAMP' })
      .where('"last_login_at" < :thresholdDate', { thresholdDate })
      .andWhere('"deleted_at" IS NULL')
      .returning('id')
      .execute();

    this.logUpdatedUsers(result, 'SoftDeleted user ID', 'No users to softDelete.');

    return thresholdDate;
  }

  private logUpdatedUsers(result: UpdateResult, message: string, noUserMessage: string) {
    const updatedUsers: Array<Pick<User, 'id'>> = result.raw ?? [];

    if (updatedUsers.length === 0) {
      this.logger.log(noUserMessage);
      return;
    }

    for (const user of updatedUsers) {
      this.logger.log(`${message}: ${user.id}`);
    }
  }
}
