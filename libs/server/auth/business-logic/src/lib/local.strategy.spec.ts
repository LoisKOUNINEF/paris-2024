import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { Roles } from '@paris-2024/shared-interfaces';
import { User } from '@paris-2024/server-data-access-user';

jest.mock('./auth.service');

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        AuthService,
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data if validation succeeds', async () => {
      const mockUser: Partial<User> = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.CUSTOMER,
        isAnonymized: false,
        deletedAt: null,
      };

      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(strategy.validate('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    });
  });
});