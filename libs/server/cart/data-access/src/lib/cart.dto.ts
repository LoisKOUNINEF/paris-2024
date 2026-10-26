import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CartDto {
  @ApiProperty()
  guestToken?: string | null;

  @ApiProperty()
  userId?: string | null;
}

export class UpdateCartDto extends PartialType(CartDto) { }

export class AddToCartDto extends CartDto {
  // 0 removes the item, a negative quantity would lower the cart total
  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsUUID()
  bundleId: string;
}