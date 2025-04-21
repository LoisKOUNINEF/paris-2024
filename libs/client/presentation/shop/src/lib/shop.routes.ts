import { Routes } from "@angular/router";
import { CartDetailsComponent } from "./cart/cart-details/cart-details.component";
import { BundleCatalogComponent } from "./bundle/bundle-catalog/bundle-catalog.component";

export const shopRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'bundles'
			},
			{
				path: 'bundles', 
				title: 'Bundles',
				component: BundleCatalogComponent,
			},
			{
				path: 'cart', 
				title: 'Cart',
				component: CartDetailsComponent,
			},
		]
	},
];
