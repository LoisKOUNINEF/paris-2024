import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { SafeString } from 'handlebars';
import MailerParams from '../../mailer.params';
import { OnOrderMailerService } from './on-order-mailer.service';

describe('OnOrderMailerService', () => {
  let service: OnOrderMailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockMailerParams: MailerParams = {
    mainUrl: 'https://example.com',
    mainImage: 'https://example.com/image.jpg',
  };

  const params = {
    orderId: 'order-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    qrCodes: ['data:image/png;base64,qr1', 'data:image/png;base64,qr2'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnOrderMailerService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: MailerParams, useValue: mockMailerParams },
      ],
    }).compile();

    service = module.get<OnOrderMailerService>(OnOrderMailerService);
  });

  it('should send tickets to the customer with a link to the order', async () => {
    mockMailerService.sendMail.mockResolvedValue({ messageId: '123abc' });

    const result = await service.sendTickets(params);

    expect(mockMailerService.sendMail).toHaveBeenCalledWith({
      to: 'john.doe@example.com',
      subject: 'Merci pour votre commande !',
      template: 'shop-mailer/on-order-mailer/on-order-mailer',
      context: {
        qrCodes: [expect.any(SafeString), expect.any(SafeString)],
        email: 'john.doe@example.com',
        firstName: 'John',
        url: 'https://example.com/shop/order/order-1',
      },
    });
    expect(result).toEqual({ messageId: '123abc' });
  });

  it('should pass qr codes as safe strings so data urls are not escaped', async () => {
    await service.sendTickets(params);

    const { qrCodes } = mockMailerService.sendMail.mock.calls[0][0].context;
    expect(qrCodes.map((qrCode: SafeString) => qrCode.toString())).toEqual(params.qrCodes);
  });

  it('should propagate mailer errors', async () => {
    mockMailerService.sendMail.mockRejectedValue(new Error('smtp failure'));

    await expect(service.sendTickets(params)).rejects.toThrow('smtp failure');
  });
});
