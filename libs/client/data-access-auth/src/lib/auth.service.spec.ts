import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { of } from 'rxjs';
import { User } from '@paris-2024/client-data-access-user';

describe('AuthService', () => {
  let service: AuthService;
  let apiRequestServiceMock: jest.Mocked<ApiRequestService>;

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should log in and set isAuth and isAdmin correctly', () => {
      const mockUserDto = { email: 'test@test.com', password: 'password' };
      const mockUser: User = { id: '1', email: 'test@test.com', role: 'admin' } as User;
      
      apiRequestServiceMock.post.mockReturnValue(of(mockUser));

      service.login(mockUserDto).subscribe((user) => {
        expect(service.isAuth()).toBe(true);
        expect(service.isAdmin()).toBe(true);
        expect(user).toEqual(mockUser);
      });

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/auth/login', mockUserDto);
    });
  });

  describe('signup', () => {
    it('should call the signup API and return the user', () => {
      const mockUserDto = { email: 'test@test.com', password: 'password' };
      const mockUser: User = { id: '1', email: 'test@test.com' } as User;
      
      apiRequestServiceMock.post.mockReturnValue(of(mockUser));

      service.signup(mockUserDto).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/auth/signup', mockUserDto);
    });
  });

  describe('logout', () => {
    it('should log out and reset isAuth and isAdmin', () => {
      const mockResponse = { success: true };

      apiRequestServiceMock.post.mockReturnValue(of(mockResponse));

      service.logout().subscribe((response) => {
        expect(service.isAuth()).toBe(false);
        expect(service.isAdmin()).toBe(false);
        expect(response).toEqual(mockResponse);
      });

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('checkUserStatus Authenticated', () => {
    it('should check authentication status and set isAuth to true', () => {
      apiRequestServiceMock.get.mockReturnValue(of(true));

      service.checkUserStatus().subscribe((isAuthenticated) => {
        expect(service.isAuth()).toBe(true);
        expect(isAuthenticated).toBe(true);
      });

      expect(apiRequestServiceMock.get).toHaveBeenCalledWith('/auth/status/is-authenticated');
    });
  });

  describe('checkUserStatus Admin', () => {
    it('should check admin status and set isAdmin to true', () => {
      apiRequestServiceMock.get.mockReturnValue(of(true));

      service.checkUserStatus().subscribe((isAdmin) => {
        expect(service.isAdmin()).toBe(true);
        expect(isAdmin).toBe(true);
      });

      expect(apiRequestServiceMock.get).toHaveBeenCalledWith('/auth/status/is-admin');
    });
  });
});
