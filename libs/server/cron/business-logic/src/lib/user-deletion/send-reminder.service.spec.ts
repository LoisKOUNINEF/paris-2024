import { Test, TestingModule } from '@nestjs/testing';
import { SendReminderService } from './send-reminder.service';
import { AnonymizeMailerService, InactiveUsersMailerService } from '@paris-2024/server-business-logic-mailer';
import { User } from '@paris-2024/server-data-access-user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { subDays, subWeeks, subYears } from 'date-fns';

describe('SendReminderService', () => {
  let service: SendReminderService;
  let loggerSpy: jest.SpyInstance;

  const mockUserRepository = {
    find: jest.fn(),
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
        },
      });
      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledTimes(2);
      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledWith('user1@example.com');
      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledWith('user2@example.com');
      expect(loggerSpy).toHaveBeenCalledTimes(2);
      expect(loggerSpy).toHaveBeenCalledWith('Sending email 24 hours before definitive account deletion to 1');
      expect(loggerSpy).toHaveBeenCalledWith('Sending email 24 hours before definitive account deletion to 2');
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
      const expectedThresholdDate = subDays(currentDate, 1);
      
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
          deletedAt: undefined,
        },
      });
      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledTimes(2);
      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledWith('inactive1@example.com');
      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledWith('inactive2@example.com');
      expect(loggerSpy).toHaveBeenCalledTimes(2);
      expect(loggerSpy).toHaveBeenCalledWith('Sending email to inactive user 1');
      expect(loggerSpy).toHaveBeenCalledWith('Sending email to inactive user 2');
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
      const expectedThresholdDate = subWeeks(subYears(currentDate, 2), 1);
      
      jest.spyOn(global, 'Date').mockImplementation(() => currentDate as any);

      await service.sendReminderToInactiveUsers();

      const findCall = mockUserRepository.find.mock.calls[0][0];
      
      expect(findCall.where.lastLoginAt.value).toEqual(expectedThresholdDate);
      
      jest.restoreAllMocks();
    });
  });

  describe('error handling', () => {
    it('should handle errors when sending anonymization reminders', async () => {
      const mockUsers = [{ id: '1', email: 'user1@example.com', deletedAt: new Date(), isAnonymized: false }];
      mockUserRepository.find.mockResolvedValue(mockUsers);
      mockAnonymizeMailerService.sendReminder.mockRejectedValueOnce(new Error('Email service error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.sendReminderBeforeAnonymization()).rejects.toThrow('Email service error');
      
      expect(mockAnonymizeMailerService.sendReminder).toHaveBeenCalledWith('user1@example.com');
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle errors when sending inactive user reminders', async () => {
      const mockUsers = [{ id: '1', email: 'inactive@example.com', lastLoginAt: new Date('2020-01-01'), deletedAt: undefined }];
      mockUserRepository.find.mockResolvedValue(mockUsers);
      mockInactiveUsersMailerService.sendReminder.mockRejectedValueOnce(new Error('Email service error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.sendReminderToInactiveUsers()).rejects.toThrow('Email service error');
      
      expect(mockInactiveUsersMailerService.sendReminder).toHaveBeenCalledWith('inactive@example.com');
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle repository errors', async () => {
      mockUserRepository.find.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.sendReminderBeforeAnonymization()).rejects.toThrow('Database error');
    });
  });
});