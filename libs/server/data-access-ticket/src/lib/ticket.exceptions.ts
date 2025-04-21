import { BadRequestException } from "@nestjs/common";

export function failedToGenerateQrCode() {
  throw new Error('Failed to generate QR code.');
}

export function ticketDoesntExist() {
  throw new BadRequestException('This ticket doesn\'t exist')
}
