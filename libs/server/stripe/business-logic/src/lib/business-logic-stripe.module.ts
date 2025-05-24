import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { getEnvValue } from '@paris-2024/server-utils';

@Module({})
export class StripeModule {

  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      providers: [
        StripeService,
        {
          provide: 'STRIPE_SECRET_KEY',
          useFactory: async (configService: ConfigService) =>{
            const secretKey = getEnvValue(configService, 'STRIPE_SECRET_KEY');
            return secretKey;
          },
          inject: [ConfigService],
        },
      ],
    };
  }
}