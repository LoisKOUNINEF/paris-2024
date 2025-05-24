import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { ITicket } from '@paris-2024/shared-interfaces';
import { uuidRegex, hashRegex } from '@paris-2024/shared-utils';
import { hash } from '@paris-2024/server-utils';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';

@Entity()
export class Ticket extends BaseEntity implements ITicket {

  @Column('text', { name: 'qr_code' })
  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  @Column('uuid', { name: 'order_id' })
  orderId: string;

  @Index('IDX_ticket_user')
  @ApiProperty()
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ApiProperty()
  @Column('boolean', { 
    default: true,
    name: 'is_valid' 
  })
  isValid: boolean;

  @Index('IDX_ticket_tokenHash')
  @ApiProperty()
  @Column({
    type: 'text',
    name: 'token_hash'
  })
  tokenHash: string;

  @BeforeInsert()
  @BeforeUpdate()
  hashToken() {
    if (uuidRegex.test(this.tokenHash)) {
      this.tokenHash = hash(this.tokenHash);
      return;
    }
    if (!hashRegex.test(this.tokenHash)) {
      throw new BadRequestException();
    }
  }
}
