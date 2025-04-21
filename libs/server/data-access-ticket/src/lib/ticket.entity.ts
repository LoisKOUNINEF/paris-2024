import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { ITicket } from '@paris-2024/shared-interfaces';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Ticket extends BaseEntity implements ITicket {

  @Index('IDX_ticket_qrCode')
  @Column()
  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  @Column()
  orderId: string;

  @Index('IDX_ticket_user')
  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  isValid: boolean;
}
