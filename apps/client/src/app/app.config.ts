import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptor, guestTokenInterceptor } from '@paris-2024/client-utils';
import { provideAnimations } from '@angular/platform-browser/animations';

import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import { provideNgxStripe } from 'ngx-stripe';
registerLocaleData(localeFr);

const STRIPE_PUBLIC = 'pk_test_51RGkDRFbzLUVwZpTJzmYSedGqjGowEpNrejVRIt5tWwYTJOEkWKbugiIs8nWrjnaGFTEBCaSlPIsCeXwn8UOE4DQ00DbLPhpew';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([errorInterceptor, guestTokenInterceptor])
    ),
    provideAnimations(),
    provideNgxStripe(STRIPE_PUBLIC), 
    {
      provide: LOCALE_ID, 
      useValue: "fr-FR" 
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'EUR'
    },
  ],
};
