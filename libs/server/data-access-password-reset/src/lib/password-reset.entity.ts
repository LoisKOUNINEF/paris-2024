import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@paris-2024/server-base-entity';

@Entity()
export class PasswordReset extends BaseEntity {
  @ApiProperty({
    example: "email@example.com"
  })
  @Column({
    type: 'text',
    unique: true 
  })
  email: string;
}
