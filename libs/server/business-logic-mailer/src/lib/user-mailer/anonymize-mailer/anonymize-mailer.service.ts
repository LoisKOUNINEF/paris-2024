import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendgridService } from '../../shared-mailer/sendgrid.service';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import MailerParams from '../../shared-mailer/mailer-params';
import { getEnvValue } from '@paris-2024/server-utils';

@Injectable()
export class AnonymizeMailerService {
  constructor(
    private readonly sendgridService: SendgridService,
    private configService: ConfigService,
    private readonly mailerParams: MailerParams,
  ) {}
  public async sendReminder(email: string) {
    const emailTemplate = fs
      .readFileSync(
        './dist/src/mailer/user-mailer/anonymize-mailer/anonymize-mailer.hbs',
      )
      .toString();

    const template = hbs.compile(emailTemplate);

    const messageBody = template({
      email: email,
      url: this.mailerParams.mainUrl,
      signupUrl: this.mailerParams.mainUrl + '/auth/signup',
      mainImage: this.mailerParams.mainImage,
    });

    const mail = {
      to: email,
      subject: 'Your Paris 2024 account will be permanently deleted',
      from: getEnvValue(this.configService, 'SENDGRID_SENDER'),
      html: messageBody,
    };

    return await this.sendgridService.send(mail);
  }
}