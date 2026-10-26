import { BadRequestException } from '@nestjs/common';
import { failedToGenerateQrCode, ticketDoesntExist } from './ticket.exceptions';

describe('Ticket exceptions', () => {
  it('failedToGenerateQrCode should throw an error', () => {
    expect(() => failedToGenerateQrCode()).toThrow('Failed to generate QR code.');
  });

  it('ticketDoesntExist should throw a bad request exception', () => {
    expect(() => ticketDoesntExist()).toThrow(BadRequestException);
  });
});
