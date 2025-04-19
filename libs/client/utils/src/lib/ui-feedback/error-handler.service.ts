import { Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ApiError, ErrorType, ErrorConfig } from './error.interface';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorSubject = new Subject<{ type: ErrorType; message: string }>();
  error$ = this.errorSubject.asObservable();

  constructor(
    private snackbarService: SnackbarService,
    private ngZone: NgZone,
  ) {}

  handleError(error: HttpErrorResponse) {
    const apiError = this.parseApiError(error);
    const errorConfig = this.getErrorConfig(apiError);
      
    this.errorSubject.next({
      type: errorConfig.type,
      message: errorConfig.displayMessage
    });

    this.ngZone.run(() => {
      this.showErrorSnackbar(errorConfig.displayMessage, errorConfig.type);
    });
  }

  private parseApiError(error: HttpErrorResponse): ApiError {
    return {
      statusCode: error.status,
      message: error.error?.message,
      error: error.error?.error || 'Unknown Error',
      msg: error.error?.msg || error.message
    };
  }

  private getErrorConfig(apiError: ApiError): ErrorConfig {
    switch (apiError.statusCode) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          displayMessage: apiError.msg
        };
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          displayMessage: 'Email or password in incorrect.'
        };
      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          displayMessage: 'Please log in to continue.'
        };
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          displayMessage: 'Resource not found.'
        };
      case 500:
        return {
          type: ErrorType.SERVER_ERROR,
          displayMessage: 'A server error occurred. Please try again later.'
        };
      default:
        return {
          type: ErrorType.SERVER_ERROR,
          displayMessage: apiError.msg || 'An unexpected error occurred.'
        };
    }
  }

  private showErrorSnackbar(message: string, type: ErrorType): void {
    const config = this.getSnackbarConfig(type);
    
    this.snackbarService.showError(message, config.panelClass)
  }

  private getSnackbarConfig(type: ErrorType) {
    const baseClass = 'error-snackbar';
    
    const typeClasses = {
      [ErrorType.VALIDATION]: [baseClass, 'validation-error'],
      [ErrorType.AUTHENTICATION]: [baseClass, 'auth-error'],
      [ErrorType.AUTHORIZATION]: [baseClass, 'auth-error'],
      [ErrorType.NOT_FOUND]: [baseClass, 'not-found-error'],
      [ErrorType.SERVER_ERROR]: [baseClass, 'server-error']
    };

    return {
      panelClass: typeClasses[type] || [baseClass]
    };
  }
}
