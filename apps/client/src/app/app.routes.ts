import { Routes } from '@angular/router';
import { LandingPageComponent, PageNotFoundComponent } from '@paris-2024/client-presentation-core';

export const appRoutes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		title: 'Paris 2024',
		component: LandingPageComponent,
	},
	{
		path: 'auth',
		loadChildren: () => import('@paris-2024/client-presentation-auth').then(m => m.authRoutes)
	},
	{
		path: 'shop',
		loadChildren: () => import('@paris-2024/client-presentation-shop').then(m => m.shopRoutes)
	},
	{
		path: 'password-reset',
		loadChildren: () => import('@paris-2024/client-presentation-password-reset').then(m => m.passwordResetRoutes)
	},
	{
		path: 'admin',
		loadChildren: () => import('@paris-2024/client-presentation-admin').then(m => m.adminRoutes)
	},
	{
		path: 'staff',
		loadChildren: () => import('@paris-2024/client-presentation-staff').then(m => m.staffRoutes)
	},
	{
		path: '**',
		pathMatch: 'full',
		title: '404',
		component: PageNotFoundComponent,
	},
];
