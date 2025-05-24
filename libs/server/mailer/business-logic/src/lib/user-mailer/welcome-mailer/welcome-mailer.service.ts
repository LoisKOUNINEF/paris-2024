import { Injectable } from '@nestjs/common';
import MailerParams from '../../mailer.params';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class WelcomeMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailerParams: MailerParams,
  ) {}
  
  public async sendWelcome(email: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Your Paris 2024 account was successfully created',
      template: 'user-mailer/welcome-mailer/welcome-mailer',
      context: {
        email,
        url: this.mailerParams.mainUrl,
        mainImage: this.mailerParams.mainImage,
      },
    });
  }
}