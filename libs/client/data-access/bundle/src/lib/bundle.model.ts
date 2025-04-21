import { BaseModel } from "@paris-2024/client-data-access-core";
import { IBundle } from "@paris-2024/shared-interfaces";

export class Bundle extends BaseModel implements IBundle {
	name: string;
	ticketAmount: number;
	price: number;
	isAvailable: boolean;

	constructor(
		name: string,
		ticketAmount: number,
		price: number,
		isAvailable: boolean
	) {
    super();
    this.name = name;
    this.ticketAmount = ticketAmount;
    this.price = price;
    this.isAvailable = isAvailable;
  }
}
