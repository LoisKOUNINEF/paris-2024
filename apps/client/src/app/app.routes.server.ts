import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: Array<ServerRoute> = [
	// static content, rendered once at build time
	{ path: '', renderMode: RenderMode.Prerender },
	{ path: 'auth/login', renderMode: RenderMode.Prerender },
	{ path: 'auth/signup', renderMode: RenderMode.Prerender },
	{ path: 'auth/pending-verification', renderMode: RenderMode.Prerender },
	{ path: 'password-reset/request-reset-link', renderMode: RenderMode.Prerender },
	{ path: 'password-reset/reset-link-sent', renderMode: RenderMode.Prerender },
	// public data that changes (bundles can be edited by the admin), rendered per request
	{ path: 'shop/bundles', renderMode: RenderMode.Server },
	// depend on the user's session, which the server render does not have
	{ path: 'shop/cart', renderMode: RenderMode.Client },
	{ path: 'shop/checkout', renderMode: RenderMode.Client },
	{ path: 'shop/order-success', renderMode: RenderMode.Client },
	{ path: 'shop/order/:id', renderMode: RenderMode.Client },
	{ path: 'user/**', renderMode: RenderMode.Client },
	{ path: 'admin/**', renderMode: RenderMode.Client },
	{ path: 'staff/**', renderMode: RenderMode.Client },
	// token links (email verification, password reset), redirects and the 404 page
	{ path: '**', renderMode: RenderMode.Server },
];
