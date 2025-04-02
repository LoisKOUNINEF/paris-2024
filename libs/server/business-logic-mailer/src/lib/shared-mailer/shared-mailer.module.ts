import { Module } from "@nestjs/common";
import { SendgridService } from "./sendgrid.service";
import MailerParams from "./mailer-params";

@Module({
  providers: [SendgridService, MailerParams],
  exports: [SendgridService, MailerParams]
})
export class SharedMailerModule {}