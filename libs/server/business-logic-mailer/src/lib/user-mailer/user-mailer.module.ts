import { Module } from "@nestjs/common";
import { AnonymizeMailerService } from "./anonymize-mailer/anonymize-mailer.service";
import { WelcomeMailerService } from "./welcome-mailer/welcome-mailer.service";
import { InactiveUsersMailerService } from "./inactive-users-mailer/inactive-users-mailer.service";
import MailerParams from "../mailer.params";
import { PasswordResetMailerService } from "./password-reset-mailer/password-reset-mailer.service";
import { EmailValidationMailerService } from "./email-validation-mailer/email-validation-mailer.service";

@Module({
  providers: [
    MailerParams,
    WelcomeMailerService,
    AnonymizeMailerService,
    InactiveUsersMailerService,
    PasswordResetMailerService,
    EmailValidationMailerService,
  ],
  exports: [
    WelcomeMailerService,
    AnonymizeMailerService,
    InactiveUsersMailerService,
    PasswordResetMailerService,
    EmailValidationMailerService,
  ]
})
export class UserMailerModule {}
