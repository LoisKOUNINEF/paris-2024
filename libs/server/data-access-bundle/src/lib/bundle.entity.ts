import { ApiProperty } from '@nestjs/swagger';
import { Check, Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { IBundle } from '@paris-2024/shared-interfaces';

@Entity()
@Unique('UQ_bundle_name', ['name'])
@Check('"price" > 0')
@Check('"ticket_amount" > 0')
export class Bundle extends BaseEntity implements IBundle {
  @ApiProperty()
  @Column({ 
    unique: true,
    type: 'text', 
    name: 'name'
  })
  name: string;

  @ApiProperty()
  @Column('integer', { name: 'price' })
  price: number;

  @ApiProperty()
  @Column('integer', { name: 'ticket_amount' })
  ticketAmount: number;

  @ApiProperty()
  @Column('boolean',{ 
    default: true,
    name: 'is_available' 
  })
  isAvailable: boolean;
}
