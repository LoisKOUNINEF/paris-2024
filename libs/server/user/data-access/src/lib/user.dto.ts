import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Roles } from '@paris-2024/shared-interfaces';
import { Exclude } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { passwordRegex } from '@paris-2024/shared-utils';

export class CreateUserDto {
  @ApiProperty({
    example: 'email@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Jane',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    example: '10Characters+',
  })
  @Matches(passwordRegex)
  password: string;

  @Exclude({ toPlainOnly: true })
  role: Roles;

  @Exclude({ toPlainOnly: true })
  cartId: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['role', 'cartId'] as const),
) {
  @ApiProperty({
    required: false,
    description: 'required to change the email or the password',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;
}

export class LoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}
