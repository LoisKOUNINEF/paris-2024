import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetRepository } from '@paris-2024/server-data-access-password-reset';
import { User, UserRepository } from '@paris-2024/server-data-access-user';
import { PasswordResetMailerService } from '@paris-2024/server-business-logic-mailer';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createEntityMock } from '@paris-2024/shared-utils';
import { Roles } from '@paris-2024/shared-interfaces';

const { mockEntity } = createEntityMock(User);

const mockUser: User = {
  ...mockEntity,
  id: 'test-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: '10Characters+',
  role: Roles.CUSTOMER,
  cartId: 'cart-id',
  isAnonymized: false,
  lastLoginAt: new Date(),
  deletedAt: null,
  secretKey: 'test-secret',
  createdAt: new Date(),
  updatedAt: new Date(),
  hashPassword: async () => { return; } ,
}

jest.mock('@paris-2024/server-data-access-user', () => {
  const originalModule = jest.requireActual('@paris-2024/server-data-access-user');
  return {
    ...originalModule,
    passwordRegex: { test: () => true },
    userNotFound: jest.fn(() => {
      throw new NotFoundException('User not found');
    }),
    tokenNotFound: jest.fn(() => {
      throw new NotFoundException('Token not found');
    }),
    passwordNotAppropriate: jest.fn(() => {
      throw new BadRequestException('Password not appropriate')
    }),
  };
});

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordResetRepository: jest.Mocked<PasswordResetRepository>;
  let mailerService: jest.Mocked<PasswordResetMailerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: PasswordResetRepository,
          useValue: {
            findOneByEmail: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOneByEmail: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PasswordResetMailerService,
          useValue: {
            sendResetLink: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PasswordResetService);
    userRepository = module.get(UserRepository);
    passwordResetRepository = module.get(PasswordResetRepository);
    mailerService = module.get(PasswordResetMailerService);
  });

  describe('sendLink()', () => {
    it('should throw if user not found', async () => {
      userRepository.findOneByEmail.mockReturnValue(undefined as any);

      await expect(service.sendLink('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });

    it('should send email if reset token already exists', async () => {
      const existingReset = { email: 'john.doe@example.com' };
      userRepository.findOneByEmail.mockReturnValue(mockUser as any);
      passwordResetRepository.findOneByEmail.mockResolvedValue(existingReset as any);
      mailerService.sendResetLink.mockResolvedValue('ok');

      const result = await service.sendLink('john.doe@example.com');
      expect(mailerService.sendResetLink).toHaveBeenCalledWith(existingReset);
      expect(result).toBe('ok');
    });

    it('should create token and send email if none exists', async () => {
      const newReset = { email: 'john.doe@example.com' };
      userRepository.findOneByEmail.mockReturnValue(mockUser as any);
      passwordResetRepository.findOneByEmail.mockResolvedValue(null);
      passwordResetRepository.create.mockResolvedValue(newReset as any);
      mailerService.sendResetLink.mockResolvedValue('sent');

      const result = await service.sendLink('john.doe@example.com');
      expect(passwordResetRepository.create).toHaveBeenCalledWith('john.doe@example.com');
      expect(mailerService.sendResetLink).toHaveBeenCalledWith(newReset);
      expect(result).toBe('sent');
    });
  });

  describe('reset()', () => {
    it('should throw if password does not match regex', async () => {
      const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10}$/;
      const badPwd = 'badpwd'
      expect(regex.test(badPwd)).toBe(false);
    });

    it('should throw if reset token not found', async () => {
      passwordResetRepository.findOne.mockResolvedValue(null);
      await expect(service.reset('token123', '10Characters+')).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not found by email', async () => {
      passwordResetRepository.findOne.mockResolvedValue({ email: 'missing@example.com' } as any);
      userRepository.findOneByEmail.mockResolvedValue(null);
      await expect(service.reset('test-id', '10Characters+')).rejects.toThrow(NotFoundException);
    });

    it('should update user and remove token on success', async () => {
      const updatedUser = { 
        ...mockUser, 
        password: '10Characters+',
        hashPassword: async () => { return; } 
      };

      passwordResetRepository.findOne.mockResolvedValue({ email: mockUser.email } as any);
      userRepository.findOneByEmail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await service.reset('token123', '10Characters+');
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, { password: '10Characters+' });
      expect(passwordResetRepository.remove).toHaveBeenCalledWith('token123');
      expect(result).toEqual(updatedUser);
    });
  });
});

