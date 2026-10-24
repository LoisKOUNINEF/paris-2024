import { Test, TestingModule } from '@nestjs/testing';
import { SendReminderService } from './send-reminder.service';
import { AnonymizeMailerService, InactiveUsersMailerService } from '@paris-2024/server-business-logic-mailer';
import { User } from '@paris-2024/server-data-access-user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { addWeeks, subDays, subYears } from 'date-fns';
import { IsNull } from 'typeorm';

describe('SendReminderService', () => {
  let service: SendReminderService;
  let loggerSpy: jest.SpyInstance;

  const mockUserRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockAnonymizeMailerService = {
    sendReminder: jest.fn(),
  };

  const mockInactiveUsersMailerService = {
    sendReminder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendReminderService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AnonymizeMailerService,
          useValue: mockAnonymizeMailerService,
        },
        {
          provide: InactiveUsersMailerService,
          useValue: mockInactiveUsersMailerService,
        },
      ],
    }).compile();

    service = module.get<SendReminderService>(SendReminderService);

    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendReminderBeforeAnonymization', () => {
    it('should send reminders to users scheduled for anonymization', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', deletedAt: new Date(), isAnonymized: false },
        { id: '2', email: 'user2@example.com', deletedAt: new Date(), isAnonymized: false },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      await service.sendReminderBeforeAnonymization();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          deletedAt: expect.any(Object),
          isAnonymized: false,
          anonymizationReminderSentAt: IsNull(),
        },
        withDeleted: true,
      });
      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledTimes(2);
      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledWith('user1@example.com');
      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledWith('user2@example.com');
      expect(loggerSpy).toHaveBeenCalledTimes(2);
      expect(loggerSpy).toHaveBeenCalledWith('Sending email 24 hours before definitive account deletion to 1');
      expect(loggerSpy).toHaveBeenCalledWith('Sending email 24 hours before definitive account deletion to 2');
    });

    it('should mark reminded users so they are not reminded again', async () => {
      mockUserRepository.find.mockResolvedValue([
        { id: '1', email: 'user1@example.com', deletedAt: new Date(), isAnonymized: false },
      ]);

      await service.sendReminderBeforeAnonymization();

      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', { anonymizationReminderSentAt: expect.any(Date) });
    });

    it('should log a message when no users need anonymization reminders', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      await service.sendReminderBeforeAnonymization();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(mockAnonymizeMailerService.sendReminder).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('No users to send reminder to.');
    });

    it('should use correct threshold date for anonymization reminders', async () => {
      mockUserRepository.find.mockResolvedValue([]);
      
      const currentDate = new Date('2023-01-30T00:00:00Z');
      // anonymization happens 7 days after deletion, remind one day before
      const expectedThresholdDate = subDays(currentDate, 6);
      
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate as any);

      await service.sendReminderBeforeAnonymization();

      const findCall = mockUserRepository.find.mock.calls[0][0];
      
      expect(findCall.where.deletedAt.value).toEqual(expectedThresholdDate);
      
      jest.restoreAllMocks();
    });
  });

  describe('sendReminderToInactiveUsers', () => {
    it('should send reminders to inactive users', async () => {
      const mockUsers = [
        { id: '1', email: 'inactive1@example.com', lastLoginAt: new Date('2020-01-01'), deletedAt: undefined },
        { id: '2', email: 'inactive2@example.com', lastLoginAt: new Date('2020-02-01'), deletedAt: undefined },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      await service.sendReminderToInactiveUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          lastLoginAt: expect.any(Object),
          inactivityReminderSentAt: IsNull(),
        },
      });
      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledTimes(2);
      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledWith('inactive1@example.com');
      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledWith('inactive2@example.com');
      expect(loggerSpy).toHaveBeenCalledTimes(2);
      expect(loggerSpy).toHaveBeenCalledWith('Sending email to inactive user 1');
      expect(loggerSpy).toHaveBeenCalledWith('Sending email to inactive user 2');
    });

    it('should mark reminded users so they are not reminded again', async () => {
      mockUserRepository.find.mockResolvedValue([
        { id: '1', email: 'inactive1@example.com', lastLoginAt: new Date('2020-01-01') },
      ]);

      await service.sendReminderToInactiveUsers();

      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', { inactivityReminderSentAt: expect.any(Date) });
    });

    it('should log a message when no inactive users found', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      await service.sendReminderToInactiveUsers();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(mockInactiveUsersMailerService.sendReminder).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('No users to send reminder to.');
    });

    it('should use correct threshold date for inactive users', async () => {
      mockUserRepository.find.mockResolvedValue([]);
      
      const currentDate = new Date('2023-01-30T00:00:00Z');
      // accounts are soft deleted after 2 years of inactivity, remind one week before
      const expectedThresholdDate = addWeeks(subYears(currentDate, 2), 1);
      
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate as any);

      await service.sendReminderToInactiveUsers();

      const findCall = mockUserRepository.find.mock.calls[0][0];
      
      expect(findCall.where.lastLoginAt.value).toEqual(expectedThresholdDate);
      
      jest.restoreAllMocks();
    });
  });

  describe('error handling', () => {
    it('should keep sending anonymization reminders when one email fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      mockUserRepository.find.mockResolvedValue([
        { id: '1', email: 'user1@example.com', deletedAt: new Date(), isAnonymized: false },
        { id: '2', email: 'user2@example.com', deletedAt: new Date(), isAnonymized: false },
      ]);
      mockAnonymizeMailerService.sendReminder.mockRejectedValueOnce(new Error('Email service error'));

      await service.sendReminderBeforeAnonymization();

      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledWith('user2@example.com');
      // the failed user is not marked, so the next run retries
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith('2', { anonymizationReminderSentAt: expect.any(Date) });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should keep sending inactivity reminders when one email fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      mockUserRepository.find.mockResolvedValue([
        { id: '1', email: 'inactive1@example.com', lastLoginAt: new Date('2020-01-01') },
        { id: '2', email: 'inactive2@example.com', lastLoginAt: new Date('2020-01-01') },
      ]);
      mockInactiveUsersMailerService.sendReminder.mockRejectedValueOnce(new Error('Email service error'));

      await service.sendReminderToInactiveUsers();

      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledWith('inactive2@example.com');
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith('2', { inactivityReminderSentAt: expect.any(Date) });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      mockUserRepository.find.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.sendReminderBeforeAnonymization()).rejects.toThrow('Database error');
    });
  });
});