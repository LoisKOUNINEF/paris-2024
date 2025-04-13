import { Injectable } from '@nestjs/common';
import MailerParams from '../../mailer.params';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class InactiveUsersMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailerParams: MailerParams,
  ) {}
  public async sendReminder(email: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Your Paris 2024 account will be suspended',
      template: './dist/src/mailer/user-mailer/inactive-users-mailer/inactive-users-mailer',
      context: {
        email: email,
        url: this.mailerParams.mainUrl,
        signupUrl: this.mailerParams.mainUrl + '/auth/signup',
        mainImage: this.mailerParams.mainImage,
      },
    });
  }
}