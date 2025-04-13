import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan, Repository } from 'typeorm';
import { User } from '@paris-2024/server-data-access-user';
import { subDays, subYears } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserDeletionService {
  private readonly logger = new Logger(UserDeletionService.name);
  private anonymizedUser = (userId: string) => {
    return {
      email: `anon-${userId}@anonymous.com`,
      firstName: 'Anonymized',
      lastName: 'User',
      isAnonymized: true,
    }
  }

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
      await this.userRepository.update(
        user.id, 
        this.anonymizedUser(user.id)
      );

      this.logger.log(`Anonymized user ID: ${user.id}`);
    }
  }

  @Cron(
    CronExpression.EVERY_DAY_AT_MIDNIGHT, 
    { name: 'soft-delete-inative-accounts' }
  )
  async softDeleteInactiveAccounts() {
    const thresholdDate = subYears(new Date(), 2);

    const usersToSoftDelete = await this.userRepository.find({
      where: {
        lastLoginAt: LessThan(thresholdDate),
        deletedAt: undefined,
      },
    });

    if (usersToSoftDelete.length === 0) {
      this.logger.log('No users to softDelete.');
      return;
    }

    for (const user of usersToSoftDelete) {
      await this.userRepository.update(
        user.id, 
        { deletedAt: new Date() },
      );

      this.logger.log(`SoftDeleted user ID: ${user.id}`);
    }

    return thresholdDate;
  }
}
