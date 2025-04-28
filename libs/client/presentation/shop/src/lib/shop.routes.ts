import { Routes } from "@angular/router";
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
				title: 'Checkout',
				component: CheckoutComponent,
			},
			{
				path: 'order-success', 
				title: 'Order Confirmed',
				component: OrderSuccessComponent,
			},
			{
				path: 'order/:id', 
				title: 'Order Details',
				component: OrderDetailsComponent,
			},
		]
	},
];
