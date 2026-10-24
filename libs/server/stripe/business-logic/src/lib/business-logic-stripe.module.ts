import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { getEnvValue } from '@paris-2024/server-utils';

@Module({})
export class StripeModule {

  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      // payment intents are created and verified by the order flow
      global: true,
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
      exports: [StripeService],
    };
  }
}