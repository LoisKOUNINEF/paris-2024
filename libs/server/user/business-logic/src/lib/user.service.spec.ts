import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { EmailValidationMailerService, WelcomeMailerService } from '@paris-2024/server-business-logic-mailer';
import { CreateUserDto, UserRepository } from '@paris-2024/server-data-access-user';
import { Roles } from '@paris-2024/shared-interfaces';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findByRole: jest.fn(),
    findUsers: jest.fn(),
    findOneById: jest.fn(),
    getUserWithSecret: jest.fn(),
    create: jest.fn(),
    verifyEmail: jest.fn(),
    requestEmailChange: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockWelcomeMailerService = {
    sendWelcome: jest.fn(),
  };

  const mockEmailValidationService = {
    sendValidationLink: jest.fn(),
  };

  const mockCartService = {
    createUserCart: jest.fn(),
    getGuestCart: jest.fn(),
    mergeGuestCartWithUserCart: jest.fn(),
  };

  const createUserDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: '10Characters+',
  } as CreateUserDto;

  const createdUser = {
    id: 'user-1',
    email: 'john.doe@example.com',
    emailVerificationToken: 'verification-token',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: WelcomeMailerService, useValue: mockWelcomeMailerService },
        { provide: EmailValidationMailerService, useValue: mockEmailValidationService },
        { provide: CartService, useValue: mockCartService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    mockUserRepository.create.mockResolvedValue(createdUser);
    mockCartService.createUserCart.mockResolvedValue({ id: 'cart-1' });
  });

  describe('create', () => {
    it('should create customers from signup', async () => {
      await service.create(createUserDto, false);

      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ ...createUserDto, role: Roles.CUSTOMER }));
    });

    it('should create staff members when created by an admin', async () => {
      await service.create(createUserDto, true);

      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ ...createUserDto, role: Roles.STAFF }));
    });

    it('should ignore a role sent in the dto', async () => {
      await service.create({ ...createUserDto, role: Roles.ADMIN } as CreateUserDto, false);

      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ role: Roles.CUSTOMER }));
    });

    it('should stop if user was not created', async () => {
      mockUserRepository.create.mockResolvedValue(null);

      await expect(service.create(createUserDto, false)).resolves.toBeUndefined();
      expect(mockCartService.createUserCart).not.toHaveBeenCalled();
      expect(mockEmailValidationService.sendValidationLink).not.toHaveBeenCalled();
      expect(mockWelcomeMailerService.sendWelcome).not.toHaveBeenCalled();
    });

    it('should create a cart for user without guest token', async () => {
      await service.create(createUserDto, false);

      expect(mockCartService.createUserCart).toHaveBeenCalledWith('user-1');
      expect(mockCartService.mergeGuestCartWithUserCart).not.toHaveBeenCalled();
    });

    it('should link guest cart to user', async () => {
      mockCartService.getGuestCart.mockResolvedValue({ id: 'guest-cart' });

      await service.create(createUserDto, false, 'guest-token');

      expect(mockCartService.getGuestCart).toHaveBeenCalledWith('guest-token');
      expect(mockCartService.mergeGuestCartWithUserCart).toHaveBeenCalledWith({
        userId: 'user-1',
        guestToken: 'guest-token',
      });
      expect(mockCartService.createUserCart).not.toHaveBeenCalled();
    });

    it('should wait for guest cart to be linked so failures are not left unhandled', async () => {
      mockCartService.getGuestCart.mockResolvedValue({ id: 'guest-cart' });
      mockCartService.mergeGuestCartWithUserCart.mockRejectedValue(new Error('db failure'));

      await expect(service.create(createUserDto, false, 'guest-token')).rejects.toThrow('db failure');
    });

    it('should not link anything when guest cart does not exist', async () => {
      mockCartService.getGuestCart.mockResolvedValue(null);

      await service.create(createUserDto, false, 'guest-token');

      expect(mockCartService.mergeGuestCartWithUserCart).not.toHaveBeenCalled();
    });

    it('should send the validation link but not the welcome email', async () => {
      const result = await service.create(createUserDto, false);

      expect(mockEmailValidationService.sendValidationLink).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        emailVerificationToken: 'verification-token',
      });
      expect(mockWelcomeMailerService.sendWelcome).not.toHaveBeenCalled();
      expect(result).toBe(createdUser);
    });
  });

  describe('verifyEmail', () => {
    it('should send the welcome email once the email is verified', async () => {
      mockUserRepository.verifyEmail.mockResolvedValue({ user: createdUser, isEmailChange: false });

      const result = await service.verifyEmail('verification-token');

      expect(mockUserRepository.verifyEmail).toHaveBeenCalledWith('verification-token');
      expect(mockWelcomeMailerService.sendWelcome).toHaveBeenCalledWith('john.doe@example.com');
      expect(result).toBe(createdUser);
    });

    it('should not send the welcome email when confirming an email change', async () => {
      mockUserRepository.verifyEmail.mockResolvedValue({ user: createdUser, isEmailChange: true });

      const result = await service.verifyEmail('verification-token');

      expect(mockWelcomeMailerService.sendWelcome).not.toHaveBeenCalled();
      expect(result).toBe(createdUser);
    });

    it('should not send the welcome email when verification fails', async () => {
      mockUserRepository.verifyEmail.mockResolvedValue(null);

      const result = await service.verifyEmail('unknown-token');

      expect(mockWelcomeMailerService.sendWelcome).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const storedUser = {
      id: 'user-1',
      email: 'john.doe@example.com',
      password: '$2b$10$hash',
    };
    const compare = bcrypt.compare as jest.Mock;

    beforeEach(() => {
      mockUserRepository.findOneById.mockResolvedValue(storedUser);
      mockUserRepository.update.mockImplementation(async (id, changes) => ({ ...storedUser, ...changes }));
    });

    it('should update names without the current password', async () => {
      await service.update('user-1', { firstName: 'Jane', email: 'john.doe@example.com' });

      expect(compare).not.toHaveBeenCalled();
      expect(mockUserRepository.requestEmailChange).not.toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', { firstName: 'Jane' });
    });

    it('should reject a password change without the current password', async () => {
      await expect(service.update('user-1', { password: 'NewPassword1#' }))
        .rejects.toThrow(BadRequestException);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should reject a password change with a wrong current password', async () => {
      compare.mockResolvedValue(false);

      await expect(service.update('user-1', { password: 'NewPassword1#', currentPassword: 'wrong' }))
        .rejects.toThrow(BadRequestException);
      expect(compare).toHaveBeenCalledWith('wrong', '$2b$10$hash');
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should change the password with the right current password', async () => {
      compare.mockResolvedValue(true);

      await service.update('user-1', { password: 'NewPassword1#', currentPassword: 'OldPassword1#' });

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', { password: 'NewPassword1#' });
    });

    it('should reject an email change with a wrong current password', async () => {
      compare.mockResolvedValue(false);

      await expect(service.update('user-1', { email: 'new@example.com', currentPassword: 'wrong' }))
        .rejects.toThrow(BadRequestException);
      expect(mockUserRepository.requestEmailChange).not.toHaveBeenCalled();
    });

    it('should send the validation link to the new email without changing the current one', async () => {
      compare.mockResolvedValue(true);
      mockUserRepository.requestEmailChange.mockResolvedValue({
        ...storedUser,
        pendingEmail: 'new@example.com',
        emailVerificationToken: 'change-token',
      });

      await service.update('user-1', { email: 'new@example.com', currentPassword: 'OldPassword1#' });

      expect(mockUserRepository.requestEmailChange).toHaveBeenCalledWith('user-1', 'new@example.com');
      expect(mockEmailValidationService.sendValidationLink).toHaveBeenCalledWith({
        email: 'new@example.com',
        emailVerificationToken: 'change-token',
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', {});
    });
  });

  describe('findAll', () => {
    it('should filter users by role when provided', async () => {
      await service.findAll(Roles.STAFF);

      expect(mockUserRepository.findByRole).toHaveBeenCalledWith(Roles.STAFF);
      expect(mockUserRepository.findUsers).not.toHaveBeenCalled();
    });

    it('should return every user without role', async () => {
      await service.findAll();

      expect(mockUserRepository.findUsers).toHaveBeenCalled();
      expect(mockUserRepository.findByRole).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft remove user', async () => {
      await service.delete('user-1');

      expect(mockUserRepository.remove).toHaveBeenCalledWith('user-1');
    });
  });
});
