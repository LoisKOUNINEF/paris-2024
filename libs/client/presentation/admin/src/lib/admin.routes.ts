import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BundleCreateComponent } from "./bundle/bundle-create/bundle-create.component";
import { BundleCatalogComponent } from "./bundle/bundle-catalog/bundle-catalog.component";

export const adminRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'Dashboard'
			},
			{
				path: 'dashnoard', 
				title: 'Dashboard',
				component: DashboardComponent,
			},
			{
				path: 'bundles/sales', 
				title: 'Sales',
				component: BundleCatalogComponent,
			},
			{
				path: 'bundles/create', 
				title: 'New Bundle',
				component: BundleCreateComponent,
			},
		]
	},
];
