import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';
import { PasswordResetExpirationService } from './password-reset-expiration.service';
import { Logger } from '@nestjs/common';
import { subHours } from 'date-fns';

describe('PasswordResetExpirationService', () => {
  let service: PasswordResetExpirationService;
  let loggerSpy: jest.SpyInstance;

  const mockPasswordResetRepository = {
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetExpirationService,
        {
          provide: getRepositoryToken(PasswordReset),
          useValue: mockPasswordResetRepository,
        },
      ],
    }).compile();

    service = module.get<PasswordResetExpirationService>(PasswordResetExpirationService);
    
    loggerSpy = jest.spyOn(Logger.prototype, 'log');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete old tokens', () => {
    it('should not delete any tokens when none match criteria', async () => {
      mockPasswordResetRepository.find.mockResolvedValue([]);

      await service.deleteExpiredTokens();

      expect(mockPasswordResetRepository.find).toHaveBeenCalledTimes(1);
      expect(mockPasswordResetRepository.find).toHaveBeenCalledWith({
        where: {
          createdAt: expect.any(Object),
        },
      });
      expect(mockPasswordResetRepository.remove).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('No tokens to remove.');
    });

    it('should remove tokens older than 1 hour', async () => {
      const mockTokens = [
        { id: 'id1', email: 'user1@example.com' },
        { id: 'id2', email: 'user2@example.com' },
      ];
      mockPasswordResetRepository.find.mockResolvedValue(mockTokens);
      mockPasswordResetRepository.remove.mockResolvedValue(undefined);

      await service.deleteExpiredTokens();

      expect(mockPasswordResetRepository.find).toHaveBeenCalledTimes(1);
      
      expect(mockPasswordResetRepository.remove).toHaveBeenCalledTimes(1);
      
      expect(mockPasswordResetRepository.remove).toHaveBeenCalledWith(mockTokens);

      expect(loggerSpy).toHaveBeenCalledWith('Old tokens have been removed.');
    });

    it('should use the correct threshold of one hour for finding tokens', async () => {
      mockPasswordResetRepository.find.mockResolvedValue([]);
      
      const currentDate = new Date('2023-01-30T00:00:00Z');
      const expectedThresholdDate = subHours(currentDate, 0);
      
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate as any);

      await service.deleteExpiredTokens();

      const findCall = mockPasswordResetRepository.find.mock.calls[0][0];
      
      expect(findCall.where.createdAt.value).toEqual(expectedThresholdDate);
      
      jest.restoreAllMocks();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockPasswordResetRepository.find.mockRejectedValue(error);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.deleteExpiredTokens()).rejects.toThrow('Database error');
      
      consoleErrorSpy.mockRestore();
    });
  });
});
