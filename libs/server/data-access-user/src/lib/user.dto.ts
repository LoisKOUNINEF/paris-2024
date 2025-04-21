import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';
import { Roles } from '@paris-2024/shared-interfaces';
import { Exclude } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { passwordRegex } from './user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'email@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Jane',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({ 
    example: '10Characters+',
  })
  /*
  ensures a minimum length of 10 characters 
  and at least 1 special character, 1 number, 1 lowercase & 1 uppercase.
  */
  @Matches(passwordRegex)
  password: string;

  @Exclude({ toPlainOnly: true })
  role: Roles;

  @Exclude({ toPlainOnly: true })
  cartId: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class LoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}
