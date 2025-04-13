import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';
import { PasswordResetExpirationService } from './password-reset-expiration.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';

jest.useFakeTimers();

describe('PasswordResetExpirationService (with Cron)', () => {
  let service: PasswordResetExpirationService;
  let deleteSpy: jest.SpyInstance;

  const mockRepository = {
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ScheduleModule.forRoot()],
      providers: [
        PasswordResetExpirationService,
        {
          provide: getRepositoryToken(PasswordReset),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PasswordResetExpirationService>(PasswordResetExpirationService);

    deleteSpy = jest.spyOn(mockRepository, 'delete').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call delete method after scheduled time', async () => {
    const testTokenId = 'test-id';

    service.scheduleTokenDeletion(testTokenId);

    jest.runOnlyPendingTimers();

    expect(deleteSpy).toHaveBeenCalledWith(testTokenId);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });
});
