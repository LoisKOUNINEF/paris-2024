import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createDataSource } from '@paris-2024/server-data-source';
import { AdminGuard, OwnerGuard, StaffGuard } from '@paris-2024/server-business-logic-guards';
import { MailerConfigService } from '@paris-2024/server-business-logic-mailer';
import { BusinessLogicCronModule } from '@paris-2024/server-business-logic-cron';
import { PresentationAuthModule } from '@paris-2024/server-presentation-auth';
import { PresentationUserModule } from '@paris-2024/server-presentation-user';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      useClass: MailerConfigService,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dataSource = createDataSource(configService);
        return dataSource.options;
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    BusinessLogicCronModule,
    PresentationAuthModule,
    PresentationUserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: StaffGuard,
    },
  ],
})
export class AppModule {}
