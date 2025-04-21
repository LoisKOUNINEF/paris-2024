import { Module } from "@nestjs/common";
import MailerParams from "../mailer.params";
import { OnOrderMailerService } from "./on-order-mailer/on-order-mailer.service";

@Module({
  providers: [
    MailerParams,
    OnOrderMailerService,
  ],
  exports: [
    OnOrderMailerService,
  ]
})
export class ShopMailerModule {}
