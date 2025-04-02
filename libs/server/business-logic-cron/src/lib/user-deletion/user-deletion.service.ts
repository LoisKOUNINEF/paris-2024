import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '@paris-2024/server-data-access-user';
import { subDays, subWeeks, subYears } from 'date-fns';

@Injectable()
export class UserDeletionService {
  private readonly logger = new Logger(UserDeletionService.name);
  private anonymizedUser = (userId: string) => {
    return {
      email: `anon-${userId}@anonymous.com`,
      firstName: 'Anonymized',
      lastName: 'User',
      deletedAt: new Date(),
      isAnonymized: true,
    }
  }

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async anonymizeDeletedAccounts() {
    const thresholdDate = subDays(new Date(), 7);

    const usersToAnonymize = await this.userRepository.find({
      where: {
        deletedAt: LessThan(thresholdDate),
        isAnonymized: false,
      },
    });

    if (usersToAnonymize.length === 0) {
      this.logger.log('No users to anonymize.');
      return;
    }

    for (const user of usersToAnonymize) {
      await this.userRepository.update(user.id, this.anonymizedUser(user.id));

      this.logger.log(`Anonymized user ID: ${user.id}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async softDeleteOldAccounts() {
    const tresholdDate = subWeeks(subYears(new Date(), 2), 1);
    return tresholdDate;
  }
}
