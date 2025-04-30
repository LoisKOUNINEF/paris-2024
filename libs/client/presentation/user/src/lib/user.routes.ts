import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UserOrdersComponent } from "./user-orders/user-orders.component";
import { EditUserComponent } from "./edit-user/edit-user.component";

export const userRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'dashboard'
			},
			{
				path: 'dashboard', 
				title: 'Dashboard',
				component: DashboardComponent,
			},
			{
				path: 'orders', 
				title: 'Orders',
				component: UserOrdersComponent,
			},
			{
				path: 'edit', 
				title: 'edit',
				component: EditUserComponent,
			},
		]
	},
];
