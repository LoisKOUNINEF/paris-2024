import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CartDto {
  @ApiProperty()
  guestToken?: string;

  @ApiProperty()
  userId?: string;
}

export class UpdateCartDto extends PartialType(CartDto) { }