import { HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@paris-2024/server-business-logic-user';
import { OWNERSHIP_GUARD_OPTIONS, OwnershipGuardOptions } from '@paris-2024/server-business-logic-guards';
import { RequestWithUser } from '@paris-2024/server-base-entity';
import { CreateUserDto } from '@paris-2024/server-data-access-user';
import { Roles } from '@paris-2024/shared-interfaces';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const currentUser = { id: 'user-1', role: Roles.CUSTOMER };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getCurrentUser', () => {
    it('should throw unauthorized if no user is logged in', () => {
      const req = { user: undefined } as RequestWithUser;

      expect(() => controller.getCurrentUser(req)).toThrow(
        new HttpException('No user is logged in.', HttpStatus.UNAUTHORIZED),
      );
      expect(mockUserService.findOne).not.toHaveBeenCalled();
    });

    it('should return the logged in user', async () => {
      mockUserService.findOne.mockResolvedValue({ id: 'user-1' });
      const req = { user: currentUser } as RequestWithUser;

      await expect(controller.getCurrentUser(req)).resolves.toEqual({ id: 'user-1' });
      expect(mockUserService.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('createUser', () => {
    it('should create user as staff', async () => {
      const dto = { email: 'staff@example.com' } as CreateUserDto;

      await controller.createUser(dto);

      expect(mockUserService.create).toHaveBeenCalledWith(dto, true);
    });
  });

  describe('updateUser', () => {
    it('should update the current user', async () => {
      const dto = { firstName: 'Jane' };

      await controller.updateUser(currentUser, 'user-1', dto);

      expect(mockUserService.update).toHaveBeenCalledWith('user-1', dto);
    });

    it('should update the user designated by the id param', async () => {
      const admin = { id: 'admin-1', role: Roles.ADMIN };
      const dto = { firstName: 'Jane' };

      await controller.updateUser(admin, 'user-2', dto);

      expect(mockUserService.update).toHaveBeenCalledWith('user-2', dto);
    });

    it('should throw unauthorized without user', () => {
      expect(() => controller.updateUser(undefined, 'user-1', {})).toThrow(HttpException);
    });
  });

  describe('deleteUser', () => {
    it('should delete the current user', async () => {
      await controller.deleteUser(currentUser, 'user-1');

      expect(mockUserService.delete).toHaveBeenCalledWith('user-1');
    });

    it('should delete the user designated by the id param', async () => {
      const admin = { id: 'admin-1', role: Roles.ADMIN };

      await controller.deleteUser(admin, 'user-2');

      expect(mockUserService.delete).toHaveBeenCalledWith('user-2');
    });

    it('should throw unauthorized without user', () => {
      expect(() => controller.deleteUser(undefined, 'user-1')).toThrow(HttpException);
    });
  });

  describe('ownership metadata', () => {
    const reflector = new Reflector();

    it.each(['updateUser', 'deleteUser'] as const)(
      '%s should check ownership against the user id',
      (handler) => {
        const options = reflector.get<OwnershipGuardOptions>(
          OWNERSHIP_GUARD_OPTIONS,
          UserController.prototype[handler],
        );

        expect(reflector.get('owner', UserController.prototype[handler])).toBe(true);
        expect(options).toEqual(expect.objectContaining({
          paramKey: 'id',
          entityService: UserService,
          findMethod: 'findOne',
          ownershipField: 'id',
        }));
      },
    );
  });
});
