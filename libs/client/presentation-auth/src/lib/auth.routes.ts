import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { RequestPasswordResetLinkComponent } from "./request-password-reset-link/request-password-reset-link.component";
import { PasswordResetLinkSentComponent } from "./password-reset-link-sent/password-reset-link-sent.component";

export const authRoutes: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'login'
			},
			{
				path: 'login', 
				title: 'Login',
				component: LoginComponent,
			},
			{
				path: 'signup', 
				title: 'Signup',
				component: SignupComponent,
			},
			{
				path: 'reset-password', 
				title: 'Reset password',
				component: ResetPasswordComponent,
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
		]
	},
];
