import { Injectable } from '@nestjs/common';
import { passwordNotAppropriate, tokenNotFound, User, userNotFound, UserRepository } from '@paris-2024/server-data-access-user';
import { PASSWORD_RESET_TTL_HOURS, PasswordReset, PasswordResetRepository } from '@paris-2024/server-data-access-password-reset';
import { subHours } from 'date-fns';
import { PasswordResetMailerService } from '@paris-2024/server-business-logic-mailer';
import { passwordRegex } from '@paris-2024/shared-utils';

@Injectable()
export class PasswordResetService {
  constructor(
    private passwordResetRepository: PasswordResetRepository,
    private userRepository: UserRepository,
    private passwordResetMailerService: PasswordResetMailerService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendLink(email: string): Promise<any> {
    const user = await this.userRepository.findOneByEmail(email);
    // answer the same way whether the email exists or not, to avoid account enumeration
    if (!user) {
      return;
    }

    // every request gets a fresh token: a resent old one could expire right after being received,
    // and links sent before stop working
    const alreadyExists = await this.passwordResetRepository.findOneByEmail(email);
    if (alreadyExists) {
      await this.passwordResetRepository.remove(alreadyExists.id);
    }

    const pwdReset = await this.passwordResetRepository.create(email);

    return await this.passwordResetMailerService.sendResetLink(pwdReset);
  }

  async reset(id: string, password: string): Promise<User | null> {
    if (!passwordRegex.test(password)) {
      passwordNotAppropriate();
      return null;
    }

    const pwdReset = await this.passwordResetRepository.findOne(id);

    if (!pwdReset) {
      tokenNotFound();
      return null;
    }

    // the cleanup cron only runs hourly
    if (this.isExpired(pwdReset)) {
      await this.passwordResetRepository.remove(id);
      tokenNotFound();
      return null;
    }

    const user = await this.userRepository.findOneByEmail(pwdReset.email);

    if (!user) {
      userNotFound();
      return null;
    }

    const updatedUser = await this.userRepository.update(
      user.id, 
      { password: password }
    );
  
    await this.passwordResetRepository.remove(id);

    return updatedUser;
  }

  private isExpired(pwdReset: PasswordReset): boolean {
    return pwdReset.createdAt < subHours(new Date(), PASSWORD_RESET_TTL_HOURS);
  }
}
