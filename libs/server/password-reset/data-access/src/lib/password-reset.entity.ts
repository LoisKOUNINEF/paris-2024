import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '@paris-2024/server-base-entity';

// reset links are only valid for this long after being sent
export const PASSWORD_RESET_TTL_HOURS = 1;

@Entity()
@Unique('UQ_password_reset_email', ['email'])
export class PasswordReset extends BaseEntity {
  @ApiProperty({
    example: "email@example.com"
  })
  @Column({
    type: 'text',
    unique: true,
    name: 'email' 
  })
  email: string;
}
