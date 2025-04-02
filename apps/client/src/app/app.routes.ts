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
		path: '**',
		pathMatch: 'full',
		title: '404',
		component: PageNotFoundComponent,
	},
];
