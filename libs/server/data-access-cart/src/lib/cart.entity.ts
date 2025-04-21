import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { ICartEntity} from '@paris-2024/shared-interfaces';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Cart extends BaseEntity implements ICartEntity {
  @Column({ 
    type: 'text',
    nullable: true,
    name: 'guest_token'
  })
  @Index('IDX_cart_guest_token')
  @ApiProperty()
  guestToken: string;

  @Column({ 
    type: 'text',
    nullable: true,
    name: 'user_id'
  })
  @Index('IDX_cart_user_id')
  @ApiProperty()
  userId: string;
}
