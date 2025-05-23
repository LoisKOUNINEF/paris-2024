import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import MailerParams from '../../mailer.params';
import { User } from '@paris-2024/server-data-access-user';

@Injectable()
export class EmailValidationMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailerParams: MailerParams,
  ) {}

  public async sendValidationLink(user: Pick<User, 'email' | 'emailVerificationToken'>) {
    const email = user.email;
    const token = user.emailVerificationToken;
    const url = `${this.mailerParams.mainUrl}/auth/verify-email/${token}`;

    return await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your Paris 2024 account password',
      template: 'user-mailer/password-reset-mailer/password-reset-mailer',
      context: {
        email,
        url,
      },
    });
  }
}
