import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '@paris-2024/server-data-access-user';
import * as bcrypt from 'bcrypt';
import { Roles } from '@paris-2024/shared-interfaces';

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
      const mockUser = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.CUSTOMER,
        cartId: '',
        isAnonymized: false,
        lastLoginAt: new Date(),
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        secretKey: 'secret',
        hashPassword: (bcrypt.hash as jest.Mock).mockReturnValue('hashedPassword'),
      };

      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
      expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
    });

    it('should return user data without sensitive fields if validation succeeds', async () => {
      const mockUser = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.CUSTOMER,
        cartId: '',
        isAnonymized: false,
        lastLoginAt: new Date(),
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        secretKey: 'secret',
        hashPassword: (bcrypt.hash as jest.Mock).mockReturnValue('hashedPassword'),
      };

      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'correctPassword');

      expect(result).toEqual({
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.CUSTOMER,
        cartId: '',
        isAnonymized: false,
        lastLoginAt: new Date(),
        hashPassword: (bcrypt.hash as jest.Mock).mockReturnValue('hashedPassword'),
      });
      expect(userRepository.findOneByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
    });
  });
});