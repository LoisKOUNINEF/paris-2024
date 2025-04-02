import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';
import { Roles } from '@paris-2024/shared-interfaces';
import { Exclude } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ 
    example: '10Characters+',
  })
  /*
  ensures a minimum length of 10 characters 
  and at least 1 special character, 1 number, 1 lowercase & 1 uppercase.
  */
  @Matches('^(?=.{10,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=]).*$')
  password: string;

  @Exclude({ toPlainOnly: true })
  role: Roles;

  @Exclude({ toPlainOnly: true })
  cartId: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
