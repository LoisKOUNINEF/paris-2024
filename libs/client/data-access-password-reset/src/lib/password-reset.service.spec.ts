import { TestBed } from '@angular/core/testing';
import { PasswordResetService } from './password-reset.service';
import { ApiRequestService } from '@paris-2024/client-data-access-core';
import { of } from 'rxjs';
import { UserDto } from '@paris-2024/client-data-access-user';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let apiRequestServiceMock: jest.Mocked<ApiRequestService>;

  beforeEach(() => {
    apiRequestServiceMock = {
      post: jest.fn(),
      get: jest.fn(),
    } as unknown as jest.Mocked<ApiRequestService>;

    TestBed.configureTestingModule({
      providers: [
        PasswordResetService,
        { provide: ApiRequestService, useValue: apiRequestServiceMock }
      ],
    });

    service = TestBed.inject(PasswordResetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sendPwdResetLink', () => {
    it('should send password reset link', () => {
      const mockUserDto: UserDto = { email: 'test@test.com' };
      const mockResponse = { success: true };

      apiRequestServiceMock.post.mockReturnValue(of(mockResponse));

      service.sendPwdResetLink(mockUserDto).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/password-reset', mockUserDto);
    });
  });

  describe('resetPwd', () => {
    it('should reset password with the given token', () => {
      const mockUserDto: UserDto = { email: 'test@test.com', password: 'newpassword' };
      const mockResponse = { success: true };
      const token = 'reset-token';

      apiRequestServiceMock.post.mockReturnValue(of(mockResponse));

      service.resetPwd(mockUserDto, token).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      expect(apiRequestServiceMock.post).toHaveBeenCalledWith('/password-reset?token=reset-token', mockUserDto);
    });
  });
});
