import { Routes } from "@angular/router";
import { ValidateTicketComponent } from "./validate-ticket/validate-ticket.component";

export const staffRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'ticket-validity'
			},
			{
				path: 'ticket-validity/:qrCode', 
				title: 'Ticket Validity',
				component: ValidateTicketComponent,
			},
		]
	},
];
