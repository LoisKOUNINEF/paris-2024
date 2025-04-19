import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { ICartEntity} from '@paris-2024/shared-interfaces';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Cart extends BaseEntity implements ICartEntity {
  @Column({ 
    type: 'text',
    nullable: true 
  })
  @Index('IDX_cart_guestToken')
  @ApiProperty()
  guestToken: string;

  @Column({ 
    type: 'text',
    nullable: true 
  })
  @Index('IDX_cart_userId')
  @ApiProperty()
  userId: string;
}
