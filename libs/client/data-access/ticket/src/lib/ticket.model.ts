import { TicketValidity } from "@paris-2024/shared-interfaces";

export class Ticket implements TicketValidity {
	isValid: boolean;
	userFullName: string;

	constructor(
		isValid: boolean,
		userFullName: string,
	) {
		this.isValid = isValid;
		this.userFullName = userFullName;
	}
}
