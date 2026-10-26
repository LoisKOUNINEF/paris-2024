import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateItemJunctionDto {
  @ApiProperty({ description: 'Quantity of items', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Bundle identifier' })
  @IsUUID()
  bundleId: string;

  @ApiProperty({ description: 'Cart identifier', required: false })
  @IsUUID()
  @IsOptional()
  cartId?: string;

  @ApiProperty({ description: 'Order identifier', required: false })
  @IsUUID()
  @IsOptional()
  orderId?: string;
}

export class UpdateItemJunctionDto extends PartialType(CreateItemJunctionDto) {};
