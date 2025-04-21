import { Injectable } from '@nestjs/common';
import { passwordRegex, passwordNotAppropriate, tokenNotFound, User, userNotFound, UserRepository } from '@paris-2024/server-data-access-user';
import { PasswordResetRepository } from '@paris-2024/server-data-access-password-reset';
import { PasswordResetMailerService } from '@paris-2024/server-business-logic-mailer';

@Injectable()
export class PasswordResetService {
  constructor(
    private passwordResetRepository: PasswordResetRepository,
    private userRepository: UserRepository,
    private passwordResetMailerService: PasswordResetMailerService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendLink(email: string): Promise<any> {
    const user = this.userRepository.findOneByEmail(email);
    if (!user) {
      userNotFound();
      return;
    }

    const alreadyExists = await this.passwordResetRepository.findOneByEmail(email);
    if (alreadyExists) {
      return await this.passwordResetMailerService.sendResetLink(alreadyExists);
    }

    const pwdReset = await this.passwordResetRepository.create(email);

    return await this.passwordResetMailerService.sendResetLink(pwdReset);
  }

  async reset(id: string, password: string): Promise<User | undefined> {
    if (!passwordRegex.test(password)) {
      passwordNotAppropriate();
      return;
    }

    const pwdReset = await this.passwordResetRepository.findOne(id);

    if (!pwdReset) {
      tokenNotFound();
      return;
    }

    const user = await this.userRepository.findOneByEmail(pwdReset.email);

    if (!user) {
      userNotFound();
      return;
    }

    const updatedUser = await this.userRepository.update(
      user.id, 
      { password: password }
    );
  
    this.passwordResetRepository.remove(id);

    return updatedUser;
  }
}
