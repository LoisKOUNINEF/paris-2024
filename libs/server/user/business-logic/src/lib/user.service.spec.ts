import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { EmailValidationMailerService, WelcomeMailerService } from '@paris-2024/server-business-logic-mailer';
import { CreateUserDto, UserRepository } from '@paris-2024/server-data-access-user';
import { Roles } from '@paris-2024/shared-interfaces';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findByRole: jest.fn(),
    findUsers: jest.fn(),
    findOneById: jest.fn(),
    getUserWithSecret: jest.fn(),
    create: jest.fn(),
    verifyEmail: jest.fn(),
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
    getCartWithBundles: jest.fn(),
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
      mockCartService.getCartWithBundles.mockResolvedValue({ id: 'guest-cart', bundles: [] });

      await service.create(createUserDto, false, 'guest-token');

      expect(mockCartService.getCartWithBundles).toHaveBeenCalledWith({ guestToken: 'guest-token' });
      expect(mockCartService.mergeGuestCartWithUserCart).toHaveBeenCalledWith({
        userId: 'user-1',
        guestToken: 'guest-token',
      });
      expect(mockCartService.createUserCart).not.toHaveBeenCalled();
    });

    it('should wait for guest cart to be linked so failures are not left unhandled', async () => {
      mockCartService.getCartWithBundles.mockResolvedValue({ id: 'guest-cart', bundles: [] });
      mockCartService.mergeGuestCartWithUserCart.mockRejectedValue(new Error('db failure'));

      await expect(service.create(createUserDto, false, 'guest-token')).rejects.toThrow('db failure');
    });

    it('should not link anything when guest cart does not exist', async () => {
      mockCartService.getCartWithBundles.mockResolvedValue(null);

      await service.create(createUserDto, false, 'guest-token');

      expect(mockCartService.mergeGuestCartWithUserCart).not.toHaveBeenCalled();
    });

    it('should send validation link and welcome emails', async () => {
      const result = await service.create(createUserDto, false);

      expect(mockEmailValidationService.sendValidationLink).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        emailVerificationToken: 'verification-token',
      });
      expect(mockWelcomeMailerService.sendWelcome).toHaveBeenCalledWith('john.doe@example.com');
      expect(result).toBe(createdUser);
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
