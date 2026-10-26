import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@paris-2024/server-data-access-user';
import { UserDeletionService } from './user-deletion.service';
import { Logger } from '@nestjs/common';
import { subDays, subYears } from 'date-fns';

describe('UserDeletionService', () => {
  let service: UserDeletionService;
  let loggerSpy: jest.SpyInstance;

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
    it('should log when no users match criteria', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ raw: [], affected: 0 });

      await service.anonymizeDeletedAccounts();

      expect(loggerSpy).toHaveBeenCalledWith('No users to anonymize.');
    });

    it('should anonymize every matching user in a single update', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'user1' }, { id: 'user2' }], affected: 2 });

      await service.anonymizeDeletedAccounts();

      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(1);
      const changes = mockQueryBuilder.set.mock.calls[0][0];
      expect(changes).toEqual(expect.objectContaining({
        firstName: 'Anonymized',
        lastName: 'User',
        pendingEmail: null,
        isAnonymized: true,
      }));
      expect(changes.email()).toBe(`'anon-' || "id" || '@anonymous.com'`);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('"is_anonymized" = false');
      expect(loggerSpy).toHaveBeenCalledWith('Anonymized user ID: user1');
      expect(loggerSpy).toHaveBeenCalledWith('Anonymized user ID: user2');
    });

    it('should only anonymize accounts deleted more than 7 days ago', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ raw: [], affected: 0 });
      
      const currentDate = new Date('2023-01-30T00:00:00Z');
      jest.useFakeTimers().setSystemTime(currentDate);

      await service.anonymizeDeletedAccounts();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '"deleted_at" < :thresholdDate',
        { thresholdDate: subDays(currentDate, 7) },
      );
      
      jest.useRealTimers();
    });

    it('should propagate database errors', async () => {
      mockQueryBuilder.execute.mockRejectedValue(new Error('Database error'));

      await expect(service.anonymizeDeletedAccounts()).rejects.toThrow('Database error');
    });
  });

  describe('softDeleteInactiveAccounts', () => {
    it('should log when no users match criteria', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ raw: [], affected: 0 });

      await service.softDeleteInactiveAccounts();

      expect(loggerSpy).toHaveBeenCalledWith('No users to softDelete.');
    });

    it('should softDelete every inactive user in a single update', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ raw: [{ id: 'user1' }, { id: 'user2' }], affected: 2 });

      await service.softDeleteInactiveAccounts();

      expect(mockQueryBuilder.execute).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.set.mock.calls[0][0].deletedAt()).toBe('CURRENT_TIMESTAMP');
      // updates do not skip soft-deleted rows by themselves
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('"deleted_at" IS NULL');
      expect(loggerSpy).toHaveBeenCalledWith('SoftDeleted user ID: user1');
      expect(loggerSpy).toHaveBeenCalledWith('SoftDeleted user ID: user2');
    });

    it('should only softDelete users inactive for more than 2 years', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ raw: [], affected: 0 });
      
      const currentDate = new Date('2023-01-30T00:00:00Z');
      jest.useFakeTimers().setSystemTime(currentDate);

      await service.softDeleteInactiveAccounts();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '"last_login_at" < :thresholdDate',
        { thresholdDate: subYears(currentDate, 2) },
      );
      
      jest.useRealTimers();
    });

    it('should propagate database errors', async () => {
      mockQueryBuilder.execute.mockRejectedValue(new Error('Database error'));

      await expect(service.softDeleteInactiveAccounts()).rejects.toThrow('Database error');
    });
  });
});
