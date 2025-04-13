import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from '@paris-2024/server-business-logic-password-reset';
import { PasswordResetExpirationService } from '@paris-2024/server-business-logic-cron';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';

describe('PasswordResetController', () => {
  let controller: PasswordResetController;
  let passwordResetService: PasswordResetService;
  let passwordResetExpirationService: PasswordResetExpirationService;

  const mockPasswordResetService = {
    sendLink: jest.fn(),
    reset: jest.fn(),
  };

  const mockPasswordResetExpirationService = {
    scheduleTokenDeletion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordResetController],
      providers: [
        {
          provide: PasswordResetService,
          useValue: mockPasswordResetService,
        },
        {
          provide: PasswordResetExpirationService,
          useValue: mockPasswordResetExpirationService,
        },
      ],
    }).compile();

    controller = module.get<PasswordResetController>(PasswordResetController);
    passwordResetService = module.get<PasswordResetService>(PasswordResetService);
    passwordResetExpirationService = module.get<PasswordResetExpirationService>(PasswordResetExpirationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendToken', () => {
    it('should call passwordResetService.sendLink with the correct email', async () => {
      const email = 'test@example.com';
      const mockToken = { id: 'token-123', email, createdAt: new Date() } as PasswordReset;
      
      mockPasswordResetService.sendLink.mockResolvedValue(mockToken);

      const result = await controller.sendToken(email);

      expect(passwordResetService.sendLink).toHaveBeenCalledWith(email);
      expect(passwordResetExpirationService.scheduleTokenDeletion).toHaveBeenCalledWith(mockToken.id);
      expect(result).toEqual({ msg: 'Reset link sent to your email.' });
    });

    it('should propagate errors from passwordResetService.sendLink', async () => {
      const email = 'test@example.com';
      const error = new Error('Service error');
      
      mockPasswordResetService.sendLink.mockRejectedValue(error);

      await expect(controller.sendToken(email)).rejects.toThrow(error);
      expect(passwordResetService.sendLink).toHaveBeenCalledWith(email);
      expect(passwordResetExpirationService.scheduleTokenDeletion).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should call passwordResetService.reset with the correct id and password', async () => {
      const id = 'token-123';
      const body = { password: 'newPassword123!' };
      
      mockPasswordResetService.reset.mockResolvedValue(undefined);

      const result = await controller.resetPassword(id, body);

      expect(passwordResetService.reset).toHaveBeenCalledWith(id, body.password);
      expect(result).toEqual({ msg: 'Password successfully updated' });
    });

    it('should propagate errors from passwordResetService.reset', async () => {
      const id = 'token-123';
      const body = { password: 'newPassword123!' };
      const error = new Error('Invalid token');
      
      mockPasswordResetService.reset.mockRejectedValue(error);

      await expect(controller.resetPassword(id, body)).rejects.toThrow(error);
      expect(passwordResetService.reset).toHaveBeenCalledWith(id, body.password);
    });
  });
});
