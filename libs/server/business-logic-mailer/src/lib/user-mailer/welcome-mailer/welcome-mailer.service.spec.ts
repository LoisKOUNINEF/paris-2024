import { Test, TestingModule } from '@nestjs/testing';
import { WelcomeMailerService } from './welcome-mailer.service';
import { MailerService } from '@nestjs-modules/mailer';
import MailerParams from '../../mailer.params';

describe('WelcomeMailerService', () => {
  let service: WelcomeMailerService;
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
        WelcomeMailerService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: MailerParams, useValue: mockMailerParams },
      ],
    }).compile();

    service = module.get<WelcomeMailerService>(WelcomeMailerService);
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

    const result = await service.sendWelcome(email);

    expect(mockMailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Your Paris 2024 account was successfully created',
      template: 'user-mailer/welcome-mailer/welcome-mailer',
      context: {
        email,
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

    await expect(service.sendWelcome(email)).rejects.toThrow('Failed to send mail');
  });
});
