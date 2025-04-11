import { Injectable } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const templateDir = isProduction
      ? path.join(__dirname, 'src', 'mailer')
      : path.join(process.cwd(), 'libs', 'server', 'business-logic-mailer', 'src', 'lib');

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
