import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { ErrorHandlerService } from './error-handler.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let errorHandler: jest.Mocked<ErrorHandlerService>;

  const request = (url: string, status: number) => {
    let error: HttpErrorResponse | undefined;
    http.get(url).subscribe({ error: (err) => error = err });
    httpMock.expectOne(url).flush({ msg: 'Oops' }, { status, statusText: 'Error' });
    return error;
  };

  beforeEach(() => {
    errorHandler = {
      handleError: jest.fn(),
    } as unknown as jest.Mocked<ErrorHandlerService>;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should let successful responses through', () => {
    let result: unknown;
    http.get('/api/bundles').subscribe((res) => result = res);
    httpMock.expectOne('/api/bundles').flush([1, 2]);

    expect(result).toEqual([1, 2]);
    expect(errorHandler.handleError).not.toHaveBeenCalled();
  });

  it('should not display an error for a 403 on the initial auth status check', () => {
    const error = request('/api/auth/status/is-admin', 403);

    expect(error?.status).toBe(403);
    expect(errorHandler.handleError).not.toHaveBeenCalled();
  });

  it('should display an error for other statuses on auth status checks', () => {
    const error = request('/api/auth/status/is-admin', 500);

    expect(error?.status).toBe(500);
    expect(errorHandler.handleError).toHaveBeenCalledWith(error);
  });

  it.each([400, 401, 403, 404, 500])('should display and rethrow a %i on other endpoints', (status) => {
    const error = request('/api/cart', status);

    expect(error?.status).toBe(status);
    expect(errorHandler.handleError).toHaveBeenCalledWith(error);
  });
});
