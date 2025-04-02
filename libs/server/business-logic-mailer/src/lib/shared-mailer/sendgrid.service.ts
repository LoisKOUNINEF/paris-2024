import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { getEnvValue } from '@paris-2024/server-utils';

@Injectable()
export class SendgridService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(getEnvValue(this.configService, 'SENDGRID_KEY'));
  }

  async send(mail: sgMail.MailDataRequired) {
    const transport = await sgMail.send(mail);

    console.log(`Email successfully dispatched to ${mail.to}`);
    return transport;
  }
}
