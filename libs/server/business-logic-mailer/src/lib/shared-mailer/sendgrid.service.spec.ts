import { Test, TestingModule } from '@nestjs/testing';
import { SendgridService } from './sendgrid.service';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { getEnvValue } from '@paris-2024/server-utils';

jest.mock('@sendgrid/mail');
jest.mock('@paris-2024/server-utils');

describe('SendgridService', () => {
  let service: SendgridService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendgridService, ConfigService],
    }).compile();

    service = module.get<SendgridService>(SendgridService);

    (getEnvValue as jest.Mock).mockReturnValue('fake-sendgrid-api-key');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call SendGrid.setApiKey with the correct key', () => {
    expect(SendGrid.setApiKey).toHaveBeenCalledWith('fake-sendgrid-api-key');
  });

  it('should send an email and return the transport result', async () => {
    const mockMailData = {
      to: 'test@example.com',
      from: 'no-reply@example.com',
      subject: 'Test email',
      text: 'This is a test email.',
    } as SendGrid.MailDataRequired;

    const mockSendResult = [{ statusCode: 202 }];
    (SendGrid.send as jest.Mock).mockResolvedValue(mockSendResult);

    const result = await service.send(mockMailData);

    expect(SendGrid.send).toHaveBeenCalledWith(mockMailData);
    expect(result).toBe(mockSendResult);
  });

  it('should handle SendGrid errors', async () => {
    const mockMailData = {
      to: 'test@example.com',
      from: 'no-reply@example.com',
      subject: 'Test email',
      text: 'This is a test email.',
    } as SendGrid.MailDataRequired;

    const mockError = new Error('SendGrid error');
    (SendGrid.send as jest.Mock).mockRejectedValue(mockError);

    await expect(service.send(mockMailData)).rejects.toThrow('SendGrid error');
    expect(SendGrid.send).toHaveBeenCalledWith(mockMailData);
  });
});
