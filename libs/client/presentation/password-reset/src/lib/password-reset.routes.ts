import { Routes } from "@angular/router";
import { RequestPasswordResetLinkComponent } from "./request-password-reset-link/request-password-reset-link.component";
import { PasswordResetLinkSentComponent } from "./password-reset-link-sent/password-reset-link-sent.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";

export const passwordResetRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'request-reset-link'
			},
			{
				path: 'request-reset-link', 
				title: 'Request reset password',
				component: RequestPasswordResetLinkComponent,
			},
			{
				path: 'reset-link-sent', 
				title: 'Reset email sent',
				component: PasswordResetLinkSentComponent,
			},
			{
				path: 'reset-password/:token', 
				title: 'Reset password',
				component: ResetPasswordComponent,
			},
		]
	},
];
