import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User, UserRepository } from '@paris-2024/server-data-access-user';
import * as bcrypt from 'bcrypt';
import { Roles } from '@paris-2024/shared-interfaces';
import { createEntityMock } from '@paris-2024/shared-mocks';

const { mockEntity } = createEntityMock(User);

const mockUser: User = {
  ...mockEntity,
  id: 'test-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: '10Characters+',
  role: Roles.CUSTOMER,
  isAnonymized: false,
  lastLoginAt: new Date(),
  deletedAt: null,
  secretKey: 'test-secret',
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: true,
  emailVerificationToken: '',
  anonymizationReminderSentAt: null,
  inactivityReminderSentAt: null,
  hashPassword: async () => { return; } ,
  hashSecretKey: async () => { return; } ,
}

jest.mock('@paris-2024/server-data-access-user');
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserRepository,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository) as jest.Mocked<UserRepository>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null if user is not found', async () => {
      userRepository.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
      expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if password does not match', async () => {
      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('john.doe@example.com', 'wrongPassword');

      expect(result).toBeNull();
      expect(userRepository.findOneByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', '10Characters+');
    });

    it('should return user data without sensitive fields if validation succeeds', async () => {
      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john.doe@example.com', '10Characters+');

      expect(result).toEqual(expect.objectContaining({
        id: 'test-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Roles.CUSTOMER,
        isAnonymized: false,
      }));
      expect(userRepository.findOneByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('10Characters+', '10Characters+');
    });

    it('should never expose password or secret key', async () => {
      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john.doe@example.com', '10Characters+');

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('secretKey');
    });

    it('should throw if email is not verified', async () => {
      userRepository.findOneByEmail.mockResolvedValue({ ...mockUser, emailVerified: false } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser('john.doe@example.com', '10Characters+'))
        .rejects.toThrow(UnauthorizedException);
      expect(userRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should check password before revealing that email is not verified', async () => {
      userRepository.findOneByEmail.mockResolvedValue({ ...mockUser, emailVerified: false } as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('john.doe@example.com', 'wrongPassword')).resolves.toBeNull();
    });

    it('should update last login date of validated user', async () => {
      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser('john.doe@example.com', '10Characters+');

      expect(userRepository.updateLastLogin).toHaveBeenCalledWith('test-id');
    });

    it('should wait for last login update so failures are not left unhandled', async () => {
      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.updateLastLogin.mockRejectedValue(new Error('db failure'));

      await expect(service.validateUser('john.doe@example.com', '10Characters+'))
        .rejects.toThrow('db failure');
    });
  });
});