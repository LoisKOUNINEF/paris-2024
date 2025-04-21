import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { ITicket } from '@paris-2024/shared-interfaces';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Ticket extends BaseEntity implements ITicket {

  @Index('IDX_ticket_qrCode')
  @Column('text', { name: 'qr_code' })
  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  @Column('text', { name: 'order_id' })
  orderId: string;

  @Index('IDX_ticket_user')
  @ApiProperty()
  @Column('text', { name: 'user_id' })
  userId: string;

  @ApiProperty()
  @Column('boolean', { 
    default: true,
    name: 'is_valid' 
  })
  isValid: boolean;
}
