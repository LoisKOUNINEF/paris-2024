import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { IItemJunction } from '@paris-2024/shared-interfaces';

@Entity()
export class ItemJunction extends BaseEntity implements IItemJunction {
  @ApiProperty()
  @Column({ default: 1 })
  quantity: number;

  @ApiProperty()
  @Column()
  subTotal: number;

  @ApiProperty()
  @Column()
  bundleId: string;

  @ApiProperty()
  @Column({ 
    type: 'text', 
    nullable: true
  })
  @Index('IDX_item_junction_cartId')
  cartId: string;

  @ApiProperty()
  @Column({ 
    type: 'text', 
    nullable: true
  })
  @Index('IDX_item_junction_orderId')
  orderId: string;
}