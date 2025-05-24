import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
	@ApiProperty()
	userId: string;
	totalPrice: number;
}