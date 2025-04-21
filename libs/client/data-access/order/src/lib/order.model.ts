import { BaseModel } from '@paris-2024/client-data-access-core';
import { IBundle, IOrderModel, ITicket } from '@paris-2024/shared-interfaces';

export class Order extends BaseModel implements IOrderModel {
	bundles: Array<IBundle>;
	tickets: Array<ITicket>;
	totalPrice: number;

	constructor(
		bundles: Array<IBundle>,
		tickets: Array<ITicket>,
		totalPrice: number
	) {
		super();
		this.bundles = bundles;
		this.tickets = tickets;
		this.totalPrice = totalPrice
	}
}
