import { Test, TestingModule } from '@nestjs/testing';
import { AnonymizeMailerService } from './anonymize-mailer.service';
import { MailerService } from '@nestjs-modules/mailer';
import MailerParams from '../../mailer.params';

describe('AnonymizeMailerService', () => {
  let service: AnonymizeMailerService;

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
        AnonymizeMailerService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: MailerParams, useValue: mockMailerParams },
      ],
    }).compile();

    service = module.get<AnonymizeMailerService>(AnonymizeMailerService);
    mockMailerService = module.get(MailerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a welcome email with correct parameters', async () => {
    const email = 'user@example.com';
    const mockSendResult = { messageId: '123abc' };

    mockMailerService.sendMail.mockResolvedValue(mockSendResult);

    const result = await service.sendReminder(email);

    expect(mockMailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Your Paris 2024 account will be permanently deleted',
      template: 'user-mailer/anonymize-mailer/anonymize-mailer',
      context: {
        email,
        signupUrl: mockMailerParams.mainUrl + '/auth/signup',
        url: mockMailerParams.mainUrl,
        mainImage: mockMailerParams.mainImage,
      },
    });

    expect(result).toBe(mockSendResult);
  });

  it('should propagate errors from mailerService', async () => {
    const email = 'user@example.com';
    const error = new Error('Failed to send mail');

    mockMailerService.sendMail.mockRejectedValue(error);

    await expect(service.sendReminder(email)).rejects.toThrow('Failed to send mail');
  });
});
