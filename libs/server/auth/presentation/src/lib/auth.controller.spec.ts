import { HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@paris-2024/server-business-logic-user';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { RequestWithUser } from '@paris-2024/server-base-entity';
import { CreateUserDto } from '@paris-2024/server-data-access-user';
import { Roles } from '@paris-2024/shared-interfaces';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUserService = {
    create: jest.fn(),
    verifyEmail: jest.fn(),
  };

  const mockCartService = {
    mergeGuestCartWithUserCart: jest.fn(),
  };

  const user = { id: 'user-1', role: Roles.CUSTOMER };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('createUser', () => {
    const dto = { email: 'john.doe@example.com' } as CreateUserDto;

    it('should create a customer and forward guest token', async () => {
      await controller.createUser(dto, 'guest-token');

      expect(mockUserService.create).toHaveBeenCalledWith(dto, false, 'guest-token');
    });

    it('should create a customer without guest token', async () => {
      await controller.createUser(dto, undefined);

      expect(mockUserService.create).toHaveBeenCalledWith(dto, false, undefined);
    });
  });

  describe('login', () => {
    it('should throw unauthorized without user', async () => {
      const req = { user: undefined } as RequestWithUser;

      await expect(controller.login(req, 'guest-token')).rejects.toThrow(
        new HttpException('Login failed', HttpStatus.UNAUTHORIZED),
      );
      expect(mockCartService.mergeGuestCartWithUserCart).not.toHaveBeenCalled();
    });

    it('should merge guest cart into user cart', async () => {
      const req = { user } as RequestWithUser;

      const result = await controller.login(req, 'guest-token');

      expect(mockCartService.mergeGuestCartWithUserCart).toHaveBeenCalledWith({
        userId: 'user-1',
        guestToken: 'guest-token',
      });
      expect(result).toEqual({ message: 'Login successful', user });
    });

    it('should wait for cart merge before answering', async () => {
      mockCartService.mergeGuestCartWithUserCart.mockRejectedValue(new Error('db failure'));
      const req = { user } as RequestWithUser;

      await expect(controller.login(req, 'guest-token')).rejects.toThrow('db failure');
    });
  });

  describe('logout', () => {
    it('should log user out', async () => {
      const req = { logout: jest.fn((done) => done()) } as unknown as RequestWithUser;

      await expect(controller.logout(req)).resolves.toEqual({ msg: 'Logged out' });
      expect(req.logout).toHaveBeenCalled();
    });

    it('should fail if logout fails', async () => {
      const req = {
        logout: jest.fn((done) => done(new Error('session store unavailable'))),
      } as unknown as RequestWithUser;

      await expect(controller.logout(req)).rejects.toThrow('session store unavailable');
    });
  });

  describe('verifyEmail', () => {
    it('should return true when token matches a user', async () => {
      mockUserService.verifyEmail.mockResolvedValue({ id: 'user-1' });

      await expect(controller.verifyEmail('token')).resolves.toBe(true);
      expect(mockUserService.verifyEmail).toHaveBeenCalledWith('token');
    });

    it('should return false when token does not match', async () => {
      mockUserService.verifyEmail.mockResolvedValue(null);

      await expect(controller.verifyEmail('token')).resolves.toBe(false);
    });
  });

  describe('access metadata', () => {
    const reflector = new Reflector();

    it('isAdmin should be restricted to admins', () => {
      expect(reflector.get('admin', AuthController.prototype.isAdmin)).toBe(true);
    });

    it('isStaff should be restricted to staff', () => {
      expect(reflector.get('staff', AuthController.prototype.isStaff)).toBe(true);
    });
  });
});
