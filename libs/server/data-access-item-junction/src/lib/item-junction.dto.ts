import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class ItemJunctionDto {
  @ApiProperty({ description: 'Quantity of items', minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Subtotal value' })
  @IsNumber()
  subTotal: number;

  @ApiProperty({ description: 'Bundle identifier' })
  @IsString()
  bundleId: string;

  @ApiProperty({ description: 'Cart identifier', required: false })
  @IsString()
  @IsOptional()
  cartId?: string;

  @ApiProperty({ description: 'Order identifier', required: false })
  @IsString()
  @IsOptional()
  orderId?: string;
}
