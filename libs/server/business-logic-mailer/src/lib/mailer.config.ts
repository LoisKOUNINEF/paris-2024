import { Injectable } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import * as path from 'path';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  createMailerOptions(): MailerOptions {

    const templateDir = path.join(__dirname, 'src', 'mailer')

    return {
      transport: {
        host: 'postfix',
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
