import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { GuestTokenService } from './guest-token.service';
import { Observable } from 'rxjs';

export const guestTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const guestTokenService = inject(GuestTokenService);
  const guestToken = guestTokenService.getGuestToken();

  if (guestToken) {
    const modified = req.clone({
      setHeaders: {
        'X-Guest-Token': guestToken,
      }
    });
    return next(modified);
  }

  return next(req);
};