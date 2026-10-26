import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, staffGuard } from '@paris-2024/client-data-access-auth';
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
		canActivate: [guestGuard],
		loadChildren: () => import('@paris-2024/client-presentation-password-reset').then(m => m.passwordResetRoutes)
	},
	{
		path: 'user',
		canActivate: [authGuard],
		loadChildren: () => import('@paris-2024/client-presentation-user').then(m => m.userRoutes)
	},
	{
		path: 'admin',
		canActivate: [adminGuard],
		loadChildren: () => import('@paris-2024/client-presentation-admin').then(m => m.adminRoutes)
	},
	{
		path: 'staff',
		canActivate: [staffGuard],
		loadChildren: () => import('@paris-2024/client-presentation-staff').then(m => m.staffRoutes)
	},
	{
		path: '**',
		pathMatch: 'full',
		title: '404',
		component: PageNotFoundComponent,
	},
];
