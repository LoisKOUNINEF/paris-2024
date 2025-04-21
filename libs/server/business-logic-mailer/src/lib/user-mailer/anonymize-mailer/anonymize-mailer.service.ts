import { Injectable } from '@nestjs/common';
import MailerParams from '../../mailer.params';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AnonymizeMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailerParams: MailerParams,
  ) {}
  public async sendReminder(email: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Your Paris 2024 account will be permanently deleted',
      template: 'user-mailer/anonymize-mailer/anonymize-mailer',
      context: {
        email: email,
        url: this.mailerParams.mainUrl,
        signupUrl: this.mailerParams.mainUrl + '/auth/signup',
        mainImage: this.mailerParams.mainImage,
      },
    });
  }
}