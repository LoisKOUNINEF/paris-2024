import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetMailerService } from './password-reset-mailer.service';
import { MailerService } from '@nestjs-modules/mailer';
import MailerParams from '../../mailer.params';
import { PasswordReset } from '@paris-2024/server-data-access-password-reset';

  	const pwdReset = {
  		id: 'test-id',
  		email: 'john.doe@example.com'
  	} as PasswordReset;
describe('WelcomeMailerService', () => {
  let service: PasswordResetMailerService;
  // let mailerService: MailerService;

  let mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockMailerParams: MailerParams = {
    mainUrl: 'https://example.com',
    mainImage: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetMailerService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: MailerParams, useValue: mockMailerParams },
      ],
    }).compile();

    service = module.get<PasswordResetMailerService>(PasswordResetMailerService);
    mockMailerService = module.get(MailerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a the reset link email with correct parameters', async () => {
    const mockSendResult = { messageId: '123abc' };

    mockMailerService.sendMail.mockResolvedValue(mockSendResult);

    const result = await service.sendResetLink(pwdReset);

    expect(mockMailerService.sendMail).toHaveBeenCalledWith({
      to: pwdReset.email,
      subject: 'Reset your Paris 2024 account password',
      template: 'user-mailer/password-reset-mailer/password-reset-mailer',
      context: {
        email: pwdReset.email,
        url: `${mockMailerParams.mainUrl}/#/reset-password/${pwdReset.id}`,
      },
    });

    expect(result).toBe(mockSendResult);
  });

  it('should propagate errors from mailerService', async () => {
    const error = new Error('Failed to send mail');

    mockMailerService.sendMail.mockRejectedValue(error);

    await expect(service.sendResetLink(pwdReset)).rejects.toThrow('Failed to send mail');
  });
});
