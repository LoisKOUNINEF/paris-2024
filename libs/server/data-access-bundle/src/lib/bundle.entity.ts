import { ApiProperty } from '@nestjs/swagger';
import { Check, Column, Entity } from 'typeorm';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { IBundle } from '@paris-2024/shared-interfaces';

@Entity()
@Check('"price" > 0')
@Check('"ticketAmount" > 0')
export class Bundle extends BaseEntity implements IBundle {
  @ApiProperty()
  @Column({ 
    unique: true,
    type: 'text', 
  })
  name: string;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty()
  @Column()
  ticketAmount: number;

  @ApiProperty()
  @Column({ default: true })
  isAvailable: boolean;
}
