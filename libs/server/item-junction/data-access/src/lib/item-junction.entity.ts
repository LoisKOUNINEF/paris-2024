import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { IItemJunction } from '@paris-2024/shared-interfaces';

@Entity()
export class ItemJunction extends BaseEntity implements IItemJunction {
  @ApiProperty()
  @Column('integer', { 
    default: 1,
    name: 'quantity'
  })
  quantity: number;

  @ApiProperty()
  @Column('uuid', { name: 'bundle_id' })
  bundleId: string;

  @ApiProperty()
  @Column({ 
    type: 'uuid', 
    nullable: true,
    name: 'cart_id',
  })
  @Index('IDX_item_junction_cart_id')
  cartId: string;

  @ApiProperty()
  @Column({ 
    type: 'uuid', 
    nullable: true,
    name: 'order_id'
  })
  @Index('IDX_item_junction_order_id')
  orderId: string;
}