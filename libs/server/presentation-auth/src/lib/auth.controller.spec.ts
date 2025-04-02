import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '@paris-2024/server-business-logic-user';

describe('AuthController', () => {
  let controller: AuthController;
  const mockUserService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{
        provide: UserService,
        useValue: mockUserService
      }]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return login successful with user when req.user exists', () => {
      const req = { user: { id: 1, name: 'Test User' }, session: { passport: {} } };
      const result = controller.login(req, undefined);
      expect(result).toEqual({
        message: 'Login successful',
        user: { id: 1, name: 'Test User' },
      });
    });

    it('should throw HttpException when req.user is missing', () => {
      const req = { user: null };
      expect(() => controller.login(req, undefined)).toThrow(
        new HttpException('Login failed', HttpStatus.UNAUTHORIZED)
      );
    });

    it('should return error message when an error occurs', () => {
      const req = { user: { id: 1, name: 'Test User' }, session: {} };
      const err = new Error('Some error');
      const result = controller.login(req, err);
      expect(result).toBe('Some error');
    });
  });

  describe('logout', () => {

    it('should log out successfully and return logged out message', async () => {
      const req = {
        logout: jest.fn((callback) => callback(null)),
      };
      const result = await controller.logout(req);
      expect(result).toEqual({ msg: 'Logged out' });
      expect(req.logout).toHaveBeenCalled();
    });

    it('should return error message when logout fails', async () => {
      const req = {
        logout: jest.fn((callback) => callback(new Error('Logout failed'))),
      };
      const result = await controller.logout(req);
      expect(result).toBe('Logout failed');
      expect(req.logout).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', () => {
      expect(controller.isAuthenticated()).toBe(true);
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is admin', () => {
      expect(controller.isAdmin()).toBe(true);
    });
  });

  describe('isStaff', () => {
    it('should return true when user is staff', () => {
      expect(controller.isStaff()).toBe(true);
    });
  });
});
