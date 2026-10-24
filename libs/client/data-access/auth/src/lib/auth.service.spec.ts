import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { of } from 'rxjs';
import { User } from '@paris-2024/client-data-access-user';

describe('AuthService', () => {
  let service: AuthService;
  let apiRequestServiceMock: jest.Mocked<ApiRequestService>;

  const mockUserDto = { email: 'test@test.com', password: 'password' };

  const loginResponse = (role: string) => ({
    message: 'Login successful',
    user: { id: '1', email: 'test@test.com', role } as unknown as User,
  });

  const mockStatusResponses = (statuses: Record<string, unknown>) => {
    apiRequestServiceMock.get.mockImplementation((url: string) =>
      of(statuses[url] as never)
    );
  };

  beforeEach(() => {
    apiRequestServiceMock = {
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as jest.Mocked<ApiRequestService>;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiRequestService, useValue: apiRequestServiceMock }
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should start unauthenticated', () => {
    expect(service.isAuth()).toBe(false);
    expect(service.isStaff()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

  describe('signup', () => {
    it('should call the signup API and return the user', () => {
      const mockUser = { id: '1', email: 'test@test.com' } as User;
      apiRequestServiceMock.post.mockReturnValue(of(mockUser));

      let result: User | undefined;
      service.signup(mockUserDto).subscribe((user) => result = user);

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/auth/signup', mockUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should set isAuth and isAdmin for an admin', () => {
      const response = loginResponse('admin');
      apiRequestServiceMock.post.mockReturnValue(of(response));

      let result: unknown;
      service.login(mockUserDto).subscribe((res) => result = res);

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/auth/login', mockUserDto);
      expect(result).toEqual(response);
      expect(service.isAuth()).toBe(true);
      expect(service.isAdmin()).toBe(true);
    });

    it('should set isAuth but not isAdmin for a regular user', () => {
      apiRequestServiceMock.post.mockReturnValue(of(loginResponse('user')));

      service.login(mockUserDto).subscribe();

      expect(service.isAuth()).toBe(true);
      expect(service.isAdmin()).toBe(false);
    });

    it('should not emit nor authenticate when login fails', () => {
      apiRequestServiceMock.post.mockReturnValue(of(null));

      const next = jest.fn();
      service.login(mockUserDto).subscribe(next);

      expect(next).not.toHaveBeenCalled();
      expect(service.isAuth()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should reset every status signal', () => {
      service.isAuth.set(true);
      service.isStaff.set(true);
      service.isAdmin.set(true);
      const mockResponse = { msg: 'Logged out' };
      apiRequestServiceMock.post.mockReturnValue(of(mockResponse));

      let result: unknown;
      service.logout().subscribe((res) => result = res);

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
      expect(service.isAuth()).toBe(false);
      expect(service.isStaff()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should keep the session state when logout fails', () => {
      service.isAuth.set(true);
      apiRequestServiceMock.post.mockReturnValue(of(null));

      service.logout().subscribe();

      expect(service.isAuth()).toBe(true);
    });
  });

  describe('verifyEmail', () => {
    it('should call the verification endpoint with the token', () => {
      apiRequestServiceMock.get.mockReturnValue(of(true));

      let result: boolean | undefined;
      service.verifyEmail('abc').subscribe((res) => result = res);

      expect(apiRequestServiceMock.get).toHaveBeenCalledWith('/auth/verify-email/abc');
      expect(result).toBe(true);
    });
  });

  describe('checkUserStatus', () => {
    it('should query every status endpoint and set the signals', () => {
      mockStatusResponses({
        '/auth/status/is-authenticated': true,
        '/auth/status/is-staff': true,
        '/auth/status/is-admin': false,
      });

      let result: unknown;
      service.checkUserStatus().subscribe((status) => result = status);

      expect(result).toEqual({ isAuth: true, isStaff: true, isAdmin: false });
      expect(service.isAuth()).toBe(true);
      expect(service.isStaff()).toBe(true);
      expect(service.isAdmin()).toBe(false);
    });

    it('should coerce failed checks (null) to false', () => {
      service.isAuth.set(true);
      service.isAdmin.set(true);
      mockStatusResponses({
        '/auth/status/is-authenticated': null,
        '/auth/status/is-staff': null,
        '/auth/status/is-admin': null,
      });

      let result: unknown;
      service.checkUserStatus().subscribe((status) => result = status);

      expect(result).toEqual({ isAuth: false, isStaff: false, isAdmin: false });
      expect(service.isAuth()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });
  });
});
