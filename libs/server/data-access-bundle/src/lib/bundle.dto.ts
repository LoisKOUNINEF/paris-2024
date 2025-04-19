import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateBundleDto {
  @ApiProperty({ description: 'Unique name of the bundle' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Price of the bundle', minimum: 1 })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({ description: 'Amount of tickets in the bundle', minimum: 1 })
  @IsNumber()
  @Min(1)
  ticketAmount: number;

  @ApiProperty({ description: 'Availability status of the bundle', default: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

export class UpdateBundleDto extends PartialType(CreateBundleDto) { }
