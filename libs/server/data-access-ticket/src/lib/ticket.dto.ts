import { ApiProperty } from '@nestjs/swagger';

export class TicketDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userSecret: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  tokenHash: string;
}

export class QrCodeTicketDto extends TicketDto {
  @ApiProperty()
  qrCode: string;
}
