import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrderDto {
	@ApiProperty()
	userId: string;
	totalPrice: number;
	paymentIntentId?: string;
}

export class NewOrderDto {
	@ApiProperty({ description: 'Stripe payment intent confirmed by the client' })
	@IsString()
	@IsNotEmpty()
	paymentIntentId: string;
}
