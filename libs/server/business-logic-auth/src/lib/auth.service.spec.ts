import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '@paris-2024/server-data-access-user';
import * as bcrypt from 'bcrypt';
import { Roles } from '@paris-2024/shared-interfaces';
import { mockUser } from '@paris-2024/server-data-access-user';

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
        cartId: 'cart-id',
        isAnonymized: false,
      }));
      expect(userRepository.findOneByEmail).toHaveBeenCalledWith('john.doe@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('10Characters+', '10Characters+');
    });
  });
});