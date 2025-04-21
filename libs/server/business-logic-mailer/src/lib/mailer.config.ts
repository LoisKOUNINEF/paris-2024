import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import * as path from 'path';
import { getEnvValue } from '@paris-2024/server-utils';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor( private configService: ConfigService ) {}

  private readonly host = getEnvValue(this.configService, 'SMTP_HOST') || 'mail-deliver_postfix';

  createMailerOptions(): MailerOptions {
    const templateDir = path.join(__dirname, 'src', 'mailer')

    return {
      transport: {
        host: this.host,
        port: 587,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: '"Paris 2024" <no-reply@lois-kouninef.eu>',
      },
      template: {
        dir: templateDir,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
