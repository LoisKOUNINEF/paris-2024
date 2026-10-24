import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import MailerParams from '../../mailer.params';
import { EmailValidationMailerService } from './email-validation-mailer.service';

describe('EmailValidationMailerService', () => {
  let service: EmailValidationMailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockMailerParams: MailerParams = {
    mainUrl: 'https://example.com',
    mainImage: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailValidationMailerService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: MailerParams, useValue: mockMailerParams },
      ],
    }).compile();

    service = module.get<EmailValidationMailerService>(EmailValidationMailerService);
  });

  it('should send validation link containing the verification token', async () => {
    mockMailerService.sendMail.mockResolvedValue({ messageId: '123abc' });

    const result = await service.sendValidationLink({
      email: 'john.doe@example.com',
      emailVerificationToken: 'verification-token',
    });

    expect(mockMailerService.sendMail).toHaveBeenCalledWith({
      to: 'john.doe@example.com',
      subject: 'Validate your email adress',
      template: 'user-mailer/email-validation-mailer/email-validation-mailer',
      context: {
        email: 'john.doe@example.com',
        url: 'https://example.com/auth/verify-email/verification-token',
      },
    });
    expect(result).toEqual({ messageId: '123abc' });
  });
});
