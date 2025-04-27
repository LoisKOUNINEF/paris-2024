import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BundleValuesComponent } from "./bundle/bundle-values/bundle-values.component";
import { BundleCatalogComponent } from "./bundle/bundle-catalog/bundle-catalog.component";

export const adminRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'bundles/sales'
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
			{
				path: 'dashnoard', 
				title: 'Dashboard',
				component: DashboardComponent,
			},
		]
	},
];
