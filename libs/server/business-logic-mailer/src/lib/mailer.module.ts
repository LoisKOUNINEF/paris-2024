import { Module } from '@nestjs/common';
import { UserMailerModule } from './user-mailer/user-mailer.module';
import { ShopMailerModule } from './shop-mailer/shop-mailer.module';

@Module({
  imports: [
    UserMailerModule,
    ShopMailerModule,
  ],
  exports: [
    UserMailerModule,
    ShopMailerModule,
  ],
})
export class MailerModule {}
