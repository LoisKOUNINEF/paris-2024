import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CartDto {
  @ApiProperty()
  guestToken?: string | null;

  @ApiProperty()
  userId?: string | null;
}

export class UpdateCartDto extends PartialType(CartDto) { }

export class AddToCartDto extends CartDto {
  quantity: number;
  bundleId: string;
}