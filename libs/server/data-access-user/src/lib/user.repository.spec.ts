import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { Roles } from '@paris-2024/shared-interfaces';
import { createEntityMock } from '@paris-2024/shared-utils';

const { mockEntity } = createEntityMock(User);

const mockUser: User = {
  ...mockEntity,
  id: 'test-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'Test@12345',
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

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
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
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
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

    it('should throw ForbiddenException if user exists and is not deleted', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      await expect(userRepository.create(mockUser as any)).rejects.toThrow(ForbiddenException);
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
