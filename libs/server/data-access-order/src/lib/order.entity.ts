import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { IOrderEntity } from '@paris-2024/shared-interfaces';
import { Entity, Column, Index } from 'typeorm';

@Entity()
export class Order extends BaseEntity implements IOrderEntity {
  @ApiProperty()
  @Column('integer', { name: 'total_price' })
  totalPrice: number;

  @Index('IDX_order_user_id')
  @ApiProperty()
  @Column('uuid', { name: 'user_id' })
  userId: string;
}
