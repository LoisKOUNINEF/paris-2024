import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';
import { Exclude } from 'class-transformer';
import { passwordRegex } from '@paris-2024/shared-utils';

export class PasswordResetDto {
  @ApiProperty({
    example: 'email@example.com',
  })
  @IsEmail()
  email: string;
}

export class PasswordResetBody {
  @ApiProperty({})
  @Matches(passwordRegex)
  @Exclude({ toPlainOnly: true })
  @ApiProperty({ 
    type: 'text', 
    example: '10Characters+',
  })
  password: string;
}
