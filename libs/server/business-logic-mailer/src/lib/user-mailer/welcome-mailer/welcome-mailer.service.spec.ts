import { Test, TestingModule } from '@nestjs/testing';
import { WelcomeMailerService } from './welcome-mailer.service';
import { SendgridService } from '../../shared-mailer/sendgrid.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as hbs from 'handlebars';
import MailerParams from '../../shared-mailer/mailer-params';

jest.mock('fs');
jest.mock('handlebars');

describe('WelcomeMailerService', () => {
  let service: WelcomeMailerService;
  let sendgridService: SendgridService;
  let configService: ConfigService;
  let mailerParams: MailerParams;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WelcomeMailerService,
        { provide: SendgridService, useValue: { send: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: MailerParams,
          useValue: {
            mainUrl: 'http://example.com',
            mainImage: 'http://example.com/image.jpg',
          },
        },
      ],
    }).compile();

    service = module.get<WelcomeMailerService>(WelcomeMailerService);
    sendgridService = module.get<SendgridService>(SendgridService);
    configService = module.get<ConfigService>(ConfigService);
    mailerParams = module.get<MailerParams>(MailerParams);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should read and compile the email template', async () => {
    const mockEmail = 'test@example.com';
    const mockTemplate = '<html>{{email}}</html>';
    const compiledTemplate = jest.fn().mockReturnValue('<html>test@example.com</html>');

    (fs.readFileSync as jest.Mock).mockReturnValue(mockTemplate);
    (hbs.compile as jest.Mock).mockReturnValue(compiledTemplate);

    (configService.get as jest.Mock).mockReturnValue('sender@example.com');

    await service.sendWelcome(mockEmail);

    expect(fs.readFileSync).toHaveBeenCalledWith(
      './dist/src/mailer/user-mailer/welcome-mailer/welcome-mailer.hbs'
    );

    expect(hbs.compile).toHaveBeenCalledWith(mockTemplate);
    expect(compiledTemplate).toHaveBeenCalledWith({
      email: mockEmail,
      url: mailerParams.mainUrl,
      mainImage: mailerParams.mainImage,
    });
  });

  it('should send an email with the correct parameters', async () => {
    const mockEmail = 'test@example.com';
    const compiledHtml = '<html>test@example.com</html>';

    (fs.readFileSync as jest.Mock).mockReturnValue('<html>{{email}}</html>');
    (hbs.compile as jest.Mock).mockReturnValue(jest.fn().mockReturnValue(compiledHtml));

    (configService.get as jest.Mock).mockReturnValue('sender@example.com');
    const sendMock = sendgridService.send as jest.Mock;

    await service.sendWelcome(mockEmail);

    expect(sendMock).toHaveBeenCalledWith({
      to: mockEmail,
      subject: 'Your Paris 2024 account was successfully created',
      from: 'sender@example.com',
      html: compiledHtml,
    });
  });
});
