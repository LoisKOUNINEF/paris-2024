import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';
import { Repository } from 'typeorm';

@Injectable()
export class PasswordResetExpirationService {
  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
  ) {}

  @Cron(
    new Date(Date.now() + 60 * 60 * 1000), 
    { name: 'delete-expired-password-reset' }
  )
  scheduleTokenDeletion(token: PasswordReset['id']) {
    this.passwordResetRepository.delete(token);
  }
}