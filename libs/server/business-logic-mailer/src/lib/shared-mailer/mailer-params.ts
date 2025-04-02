import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getEnvValue } from '@paris-2024/server-utils';

@Injectable()
export default class MailerParams {
  constructor(private configService: ConfigService) {}

  sender = getEnvValue(this.configService, 'SENDGRID_SENDER');
  admin = getEnvValue(this.configService, 'ADMIN_EMAIL');
  mainImage =
    'https://www.shutterstock.com/shutterstock/photos/2263139095/display_1500/stock-vector-paris-france-february-official-logo-of-summer-olympic-game-in-paris-esp-vector-2263139095.jpg';
  mainUrl = 'www.studi-exam-jo.lois-kouninef.eu';
}
