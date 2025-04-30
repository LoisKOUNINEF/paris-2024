import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BundleValuesComponent } from "./bundle/bundle-values/bundle-values.component";
import { BundleCatalogComponent } from "./bundle/bundle-catalog/bundle-catalog.component";
import { CreateStaffComponent } from "./create-staff/create-staff.component";

export const adminRoutes: Routes = [
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
				path: 'staff/create', 
				title: 'Create Staff Member',
				component: CreateStaffComponent,
			},
			{
				path: 'bundles/sales', 
				title: 'Sales',
				component: BundleCatalogComponent,
			},
			{
				path: 'bundles/create', 
				title: 'New Bundle',
				component: BundleValuesComponent,
			},
			{
				path: 'bundles/update/:id', 
				title: 'Update Bundle',
				component: BundleValuesComponent,
			},
		]
	},
];
