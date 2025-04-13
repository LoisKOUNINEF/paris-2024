import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';
import MailerParams from '../../mailer.params';

@Injectable()
export class PasswordResetMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailerParams: MailerParams,
  ) {}

  public async sendResetLink(pwdReset: PasswordReset) {
    const email = pwdReset.email;
    const token = pwdReset.id;
    const url = `${this.mailerParams.mainUrl}/#/reset-password/${token}`;

    return await this.mailerService.sendMail({
      to: pwdReset.email,
      subject: 'Your password has been reset',
      template: './dist/src/mailer/user-mailer/password-reset-mailer/password-reset-mailer',
      context: {
        email,
        url,
      },
    });
  }
}
