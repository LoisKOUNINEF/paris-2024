export class BundleDto {
	name: string | undefined;
	ticketAmount: number | undefined;
	price: number | undefined;
	
	constructor(formValue: BundleFormValue) {
		this.name = formValue.name;
		this.ticketAmount = formValue.ticketAmount;
		this.price = formValue.price;
	}
}

export interface BundleFormValue {
	name?: string;
	ticketAmount?: number;
	price?: number;
}
