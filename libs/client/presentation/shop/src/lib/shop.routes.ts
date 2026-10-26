import { Routes } from "@angular/router";
import { authGuard } from "@paris-2024/client-data-access-auth";
import { CartDetailsComponent } from "./cart/cart-details/cart-details.component";
import { BundleCatalogComponent } from "./bundle/bundle-catalog/bundle-catalog.component";
import { CheckoutComponent } from "./order/checkout/checkout.component";
import { OrderSuccessComponent } from "./order/order-success/order-success.component";
import { OrderDetailsComponent } from "./order/order-details/order-details.component";

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
			{
				path: 'checkout', 
				canActivate: [authGuard],
				title: 'Checkout',
				component: CheckoutComponent,
			},
			{
				path: 'order-success', 
				canActivate: [authGuard],
				title: 'Order Confirmed',
				component: OrderSuccessComponent,
			},
			{
				path: 'order/:id', 
				canActivate: [authGuard],
				title: 'Order Details',
				component: OrderDetailsComponent,
			},
		]
	},
];
