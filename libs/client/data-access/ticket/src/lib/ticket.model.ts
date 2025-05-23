import { BaseModel } from "@paris-2024/client-data-access-core";
import { TicketValidity } from "@paris-2024/shared-interfaces";

export class Ticket extends BaseModel implements TicketValidity {
	isValid: boolean;
	userFullName: string;

	constructor(
		isValid: boolean,
		userFullName: string,
	) {
		super()
		this.isValid = isValid;
		this.userFullName = userFullName;
	}
}
