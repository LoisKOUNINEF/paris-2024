export class CartDto {
	quantity?: number | undefined;
	bundleId: string | undefined;
	guestToken?: string | undefined;
	
	constructor(formValue: CartFormValue) {
		this.quantity = formValue.quantity;
		this.bundleId = formValue.bundleId;
		this.guestToken = formValue.guestToken;
	}
}

export interface CartFormValue {
	quantity?: number;
	bundleId?: string;
	guestToken?: string;
}

