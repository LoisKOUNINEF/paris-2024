import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { SnackbarService } from './snackbar.service';
import { ErrorType } from './error.interface';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let snackbarService: jest.Mocked<SnackbarService>;

  const httpError = (status: number, error: unknown = null) =>
    new HttpErrorResponse({ status, error, statusText: 'Error', url: '/api/test' });

  beforeEach(() => {
    snackbarService = {
      showError: jest.fn(),
    } as unknown as jest.Mocked<SnackbarService>;

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: SnackbarService, useValue: snackbarService },
      ],
    });
    service = TestBed.inject(ErrorHandlerService);
  });

  it.each([
    [400, { msg: 'Email is invalid' }, ErrorType.VALIDATION, 'Email is invalid', 'validation-error'],
    [401, null, ErrorType.AUTHENTICATION, 'Email or password in incorrect.', 'auth-error'],
    [403, null, ErrorType.AUTHORIZATION, 'Please log in to continue.', 'auth-error'],
    [404, null, ErrorType.NOT_FOUND, 'Resource not found.', 'not-found-error'],
    [500, null, ErrorType.SERVER_ERROR, 'A server error occurred. Please try again later.', 'server-error'],
  ])('should map a %i to its message and snackbar style', (status, body, type, message, panelClass) => {
    const emitted: unknown[] = [];
    service.error$.subscribe((e) => emitted.push(e));

    service.handleError(httpError(status, body));

    expect(emitted).toEqual([{ type, message }]);
    expect(snackbarService.showError).toHaveBeenCalledWith(message, ['error-snackbar', panelClass]);
  });

  it('should fall back to the HTTP message when a 400 has no msg', () => {
    const error = httpError(400);

    service.handleError(error);

    expect(snackbarService.showError).toHaveBeenCalledWith(error.message, ['error-snackbar', 'validation-error']);
  });

  it('should use the API msg for unmapped statuses', () => {
    service.handleError(httpError(409, { msg: 'Already exists' }));

    expect(snackbarService.showError).toHaveBeenCalledWith('Already exists', ['error-snackbar', 'server-error']);
  });

  it('should use the HTTP message for unmapped statuses without msg', () => {
    const error = httpError(0);

    service.handleError(error);

    expect(snackbarService.showError).toHaveBeenCalledWith(error.message, ['error-snackbar', 'server-error']);
  });
});
