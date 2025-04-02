import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@paris-2024/server-data-access-user';
import { UserDeletionService } from './user-deletion.service';
import { Logger } from '@nestjs/common';
import { subDays } from 'date-fns';

describe('UserDeletionService', () => {
  let service: UserDeletionService;
  let loggerSpy: jest.SpyInstance;

  const mockUserRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeletionService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserDeletionService>(UserDeletionService);
    
    loggerSpy = jest.spyOn(Logger.prototype, 'log');
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('anonymizeDeletedAccounts', () => {
    it('should not anonymize any users when none match criteria', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      await service.anonymizeDeletedAccounts();

      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          deletedAt: expect.any(Object),
          isAnonymized: false,
        },
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('No users to anonymize.');
    });

    it('should anonymize users deleted more than 7 days ago', async () => {
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', isAnonymized: false },
        { id: 'user2', email: 'user2@example.com', isAnonymized: false },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);
      mockUserRepository.update.mockResolvedValue(undefined);

      await service.anonymizeDeletedAccounts();

      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
      
      expect(mockUserRepository.update).toHaveBeenCalledTimes(2);
      
      expect(mockUserRepository.update).toHaveBeenCalledWith('user1', {
        email: 'anon-user1@anonymous.com',
        firstName: 'Anonymized',
        lastName: 'User',
        deletedAt: expect.any(Date),
        isAnonymized: true,
      });
      
      expect(mockUserRepository.update).toHaveBeenCalledWith('user2', {
        email: 'anon-user2@anonymous.com',
        firstName: 'Anonymized',
        lastName: 'User',
        deletedAt: expect.any(Date),
        isAnonymized: true,
      });
      
      expect(loggerSpy).toHaveBeenCalledWith('Anonymized user ID: user1');
      expect(loggerSpy).toHaveBeenCalledWith('Anonymized user ID: user2');
    });

    it('should use the correct threshold date for finding users', async () => {
      mockUserRepository.find.mockResolvedValue([]);
      
      const currentDate = new Date('2023-01-10T00:00:00Z');
      const expectedThresholdDate = subDays(currentDate, 7);
      
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate as any);

      await service.anonymizeDeletedAccounts();

      const findCall = mockUserRepository.find.mock.calls[0][0];
      
      expect(findCall.where.deletedAt.value).toEqual(expectedThresholdDate);
      
      jest.restoreAllMocks();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockUserRepository.find.mockRejectedValue(error);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.anonymizeDeletedAccounts()).rejects.toThrow('Database error');
      
      consoleErrorSpy.mockRestore();
    });
  });
});
