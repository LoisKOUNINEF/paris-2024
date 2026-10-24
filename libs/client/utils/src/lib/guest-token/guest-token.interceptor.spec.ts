import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { guestTokenInterceptor } from './guest-token.interceptor';
import { GuestTokenService } from './guest-token.service';

describe('guestTokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let guestTokenService: jest.Mocked<GuestTokenService>;

  beforeEach(() => {
    guestTokenService = {
      getGuestToken: jest.fn(),
    } as unknown as jest.Mocked<GuestTokenService>;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([guestTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: GuestTokenService, useValue: guestTokenService },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add the X-Guest-Token header when a guest token exists', () => {
    guestTokenService.getGuestToken.mockReturnValue('guest-123');

    http.get('/api/cart').subscribe();

    const req = httpMock.expectOne('/api/cart');
    expect(req.request.headers.get('X-Guest-Token')).toBe('guest-123');
    req.flush({});
  });

  it.each([null, ''])('should not add the header when the token is %p', (token) => {
    guestTokenService.getGuestToken.mockReturnValue(token);

    http.get('/api/cart').subscribe();

    const req = httpMock.expectOne('/api/cart');
    expect(req.request.headers.has('X-Guest-Token')).toBe(false);
    req.flush({});
  });
});
