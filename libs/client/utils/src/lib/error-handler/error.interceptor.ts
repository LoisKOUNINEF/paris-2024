import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
    // prevent error banner display for initial user status check requests
    if(
      error.status === 403 
      && req.url.includes('auth/status')
    ) {
      return throwError(() => error);
    }
      errorHandler.handleError(error);
      return throwError(() => error);
    })
  );
};
