import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendgridService } from '../../shared-mailer/sendgrid.service';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import MailerParams from '../../shared-mailer/mailer-params';
import { getEnvValue } from '@paris-2024/server-utils';

@Injectable()
export class WelcomeMailerService {
  constructor(
    private readonly sendgridService: SendgridService,
    private configService: ConfigService,
    private readonly mailerParams: MailerParams,
  ) {}
  public async sendWelcome(email: string) {
    const emailTemplate = fs
      .readFileSync(
        './dist/src/mailer/user-mailer/welcome-mailer/welcome-mailer.hbs',
      )
      .toString();

    const template = hbs.compile(emailTemplate);

    const messageBody = template({
      email: email,
      url: this.mailerParams.mainUrl,
      mainImage: this.mailerParams.mainImage,
    });

    const mail = {
      to: email,
      subject: 'Your Paris 2024 account was successfully created',
      from: getEnvValue(this.configService, 'SENDGRID_SENDER'),
      html: messageBody,
    };

    return await this.sendgridService.send(mail);
  }
}