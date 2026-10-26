import { Routes } from "@angular/router";
import { guestGuard } from "@paris-2024/client-data-access-auth";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { VerifyEmailComponent } from "./verify-email/verify-email.component";
import { PendingVerificationComponent } from "./pending-verification/pending-verification.component";

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
				canActivate: [guestGuard],
				title: 'Login',
				component: LoginComponent,
			},
			{
				path: 'signup', 
				canActivate: [guestGuard],
				title: 'Signup',
				component: SignupComponent,
			},
			{
				path: 'pending-verification', 
				title: 'Pending Verification',
				component: PendingVerificationComponent,
			},
			{
				path: 'verify-email/:token', 
				title: 'Email Verification',
				component: VerifyEmailComponent,
			},
		]
	},
];
