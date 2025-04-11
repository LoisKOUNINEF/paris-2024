import { Module } from "@nestjs/common";
import { AnonymizeMailerService } from "./anonymize-mailer/anonymize-mailer.service";
import { WelcomeMailerService } from "./welcome-mailer/welcome-mailer.service";
import { InactiveUsersMailerService } from "./inactive-users-mailer/inactive-users-mailer.service";
import MailerParams from "../mailer.params";

@Module({
  providers: [
    MailerParams,
    WelcomeMailerService,
    AnonymizeMailerService,
    InactiveUsersMailerService,
  ],
  exports: [
    WelcomeMailerService,
    AnonymizeMailerService,
    InactiveUsersMailerService,
  ]
})
export class UserMailerModule {}
