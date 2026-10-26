import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { createEntityMock } from '@paris-2024/shared-mocks';
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
  isAnonymized: false,
  lastLoginAt: new Date(),
  deletedAt: null,
  secretKey: 'test-secret',
  createdAt: new Date(),
  updatedAt: new Date(),
  emailVerified: true,
  emailVerificationToken: '',
  pendingEmail: null,
  anonymizationReminderSentAt: null,
  inactivityReminderSentAt: null,
  hashPassword: async () => { return; } ,
  hashSecretKey: async () => { return; } ,
}

const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  restore: jest.fn(),
  remove: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(),
  softRemove: jest.fn(),
};

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findUsers', () => {
    it('should return an array of users excluding deleted ones', async () => {
      jest.spyOn(userRepo, 'find').mockResolvedValue([mockUser]);

      const result = await userRepository.findUsers();
      expect(result).toEqual([mockUser]);
      expect(userRepo.find).toHaveBeenCalledWith({ where: { deletedAt: undefined } });
    });
  });

  describe('findByRole', () => {
    it('should return an array of users with specified role', async () => {
      const queryBuilderMock = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };

      jest.spyOn(userRepo, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const result = await userRepository.findByRole('customer');
      expect(result).toEqual([mockUser]);
      expect(userRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should return the user when found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      const result = await userRepository.findOneById(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
    });

    it('should throw NotFoundException when the user is not found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(userRepository.findOneById(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByEmail', () => {
    it('should return the user when found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      const result = await userRepository.findOneByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email }, withDeleted: true });
    });
  });

  describe('create', () => {
    it('should return the restored user if user exists and is deleted', async () => {
      mockUser.deletedAt = new Date();
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
      const restoreSpy = jest.spyOn(userRepo, 'save').mockResolvedValue(mockUser);

      const result = await userRepository.create(mockUser as any);
      expect(result).toEqual(mockUser);
      expect(restoreSpy).toHaveBeenCalledWith(mockUser);

      mockUser.deletedAt = null;
    });

    it('should clear reminder flags when a deleted user is restored', async () => {
      const deletedUser = {
        ...mockUser,
        deletedAt: new Date(),
        anonymizationReminderSentAt: new Date(),
        inactivityReminderSentAt: new Date(),
      } as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(deletedUser);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      await userRepository.create(mockUser as any);

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        anonymizationReminderSentAt: null,
        inactivityReminderSentAt: null,
      }));
    });

    it('should require a new email verification when a deleted user is restored', async () => {
      const deletedUser = {
        ...mockUser,
        deletedAt: new Date(),
        emailVerified: true,
        emailVerificationToken: null,
      } as unknown as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(deletedUser);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      await userRepository.create({ ...mockUser } as any);

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        emailVerified: false,
        emailVerificationToken: expect.any(String),
      }));
      expect(saveSpy.mock.calls[0][0]).not.toHaveProperty('emailVerificationToken', null);
    });

    it('should apply the signup names and role when a deleted user is restored', async () => {
      const deletedUser = {
        ...mockUser,
        deletedAt: new Date(),
        firstName: 'Old',
        lastName: 'Name',
        role: Roles.CUSTOMER,
      } as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(deletedUser);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      await userRepository.create({
        email: mockUser.email,
        firstName: 'New',
        lastName: 'Staff',
        password: 'NewPassword1#',
        role: Roles.STAFF,
      } as any);

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'New',
        lastName: 'Staff',
        password: 'NewPassword1#',
        role: Roles.STAFF,
      }));
    });

    it('should clear a pending email when a deleted user is restored', async () => {
      const deletedUser = {
        ...mockUser,
        deletedAt: new Date(),
        pendingEmail: 'pending@example.com',
      } as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(deletedUser);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      await userRepository.create({ ...mockUser } as any);

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ pendingEmail: null }));
    });

    it('should throw ConflictException if user exists and is not deleted', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      await expect(userRepository.create(mockUser as any)).rejects.toThrow(ConflictException);
    });

    it('should not turn an existing customer into staff', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ ...mockUser, deletedAt: null } as User);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear();

      await expect(userRepository.create({
        email: mockUser.email,
        firstName: 'Staff',
        lastName: 'Member',
        password: 'NewPassword1#',
        role: Roles.STAFF,
      } as any)).rejects.toThrow(ConflictException);
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should create and return a new user', async () => {
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(userRepo, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepo, 'save').mockResolvedValue(mockUser);

      const result = await userRepository.create(mockUser as any);
      expect(result).toEqual(mockUser);
      expect(userRepo.create).toHaveBeenCalledWith(mockUser);
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('verifyEmail', () => {
    it('should mark the email as verified for a new account', async () => {
      const user = { ...mockUser, emailVerified: false, emailVerificationToken: 'token' } as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      const result = await userRepository.verifyEmail('token');

      expect(result).toEqual({ user, isEmailChange: false });
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        emailVerified: true,
        emailVerificationToken: null,
      }));
    });

    it('should swap in the pending email', async () => {
      const user = { ...mockUser, pendingEmail: 'new@example.com', emailVerificationToken: 'token' } as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      const result = await userRepository.verifyEmail('token');

      expect(result).toEqual({ user, isEmailChange: true });
      expect(userRepository.findOneByEmail).toHaveBeenCalledWith('new@example.com');
      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@example.com',
        pendingEmail: null,
        emailVerificationToken: null,
      }));
    });

    it('should reject the pending email if it was taken in the meantime', async () => {
      const user = { ...mockUser, pendingEmail: 'new@example.com', emailVerificationToken: 'token' } as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue({ ...mockUser, id: 'other' } as User);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear();

      await expect(userRepository.verifyEmail('token')).rejects.toThrow(ConflictException);
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for an unknown token', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(userRepository.verifyEmail('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestEmailChange', () => {
    it('should store the new email as pending with a fresh token', async () => {
      jest.spyOn(userRepository, 'findOneById').mockResolvedValue({ ...mockUser } as User);
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      const result = await userRepository.requestEmailChange(mockUser.id, 'new@example.com');

      expect(result).toEqual(expect.objectContaining({
        email: mockUser.email,
        pendingEmail: 'new@example.com',
        emailVerificationToken: expect.any(String),
      }));
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should reject an email used by another account', async () => {
      jest.spyOn(userRepository, 'findOneById').mockResolvedValue({ ...mockUser } as User);
      jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue({ ...mockUser, id: 'other' } as User);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear();

      await expect(userRepository.requestEmailChange(mockUser.id, 'taken@example.com'))
        .rejects.toThrow(ConflictException);
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepo, 'save').mockResolvedValue(mockUser);

      const result = await userRepository.update(mockUser.id, mockUser as any);
      expect(result).toEqual(mockUser);
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneById').mockResolvedValue(undefined);

      await expect(userRepository.update(mockUser.id, mockUser as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login date and clear inactivity reminder flag', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({ ...mockUser, inactivityReminderSentAt: new Date() } as User);
      const saveSpy = jest.spyOn(userRepo, 'save').mockClear().mockImplementation(async (user) => user as User);

      await userRepository.updateLastLogin(mockUser.id);

      expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
        lastLoginAt: expect.any(Date),
        inactivityReminderSentAt: null,
      }));
    });
  });

  describe('remove', () => {
    it('should soft remove and return the user', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepo, 'softRemove').mockResolvedValue(mockUser);

      const result = await userRepository.remove(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(userRepo.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      jest.spyOn(userRepository, 'findOneById').mockResolvedValue(undefined);

      await expect(userRepository.remove(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });
});
