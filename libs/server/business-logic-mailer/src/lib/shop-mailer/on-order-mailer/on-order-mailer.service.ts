import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SafeString } from 'handlebars';
import MailerParams from '../../mailer.params';

export interface OnOrderMailParams {
  orderId: string;
  email: string;
  firstName: string;
  qrCodes: Array<string>;
}

interface OnOrderMailContext {
  qrCodes: Array<SafeString>;
  email: string;
  firstName: string;
  url: string;
}

@Injectable()
export class OnOrderMailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailerParams: MailerParams,
  ) {}

  public async sendTickets(params: OnOrderMailParams) {
    const context = await this.parseParams(params);

    return await this.mailerService.sendMail({
      to: params.email,
      subject: 'Merci pour votre commande !',
      template: 'shop-mailer/on-order-mailer/on-order-mailer',
      context: context,
    });
  }

  private async parseParams(params: OnOrderMailParams): Promise<OnOrderMailContext> {
    const orderDetailsUrl = `${this.mailerParams.mainUrl}/shop/orders/order/${params.orderId}`;
    const qrCodes: Array<SafeString> = [];

    for (const qrCode of params.qrCodes) {
      qrCodes.push(new SafeString(qrCode));
    }

    return {
      qrCodes: qrCodes,
      email: params.email,
      firstName: params.firstName,
      url: orderDetailsUrl,
    };
  }
}