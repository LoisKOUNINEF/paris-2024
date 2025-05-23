import { Routes } from "@angular/router";
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
				title: 'Login',
				component: LoginComponent,
			},
			{
				path: 'signup', 
				title: 'Signup',
				component: SignupComponent,
			},
			{
				path: 'verify-email/:token', 
				title: 'Email Verification',
				component: VerifyEmailComponent,
			},
			{
				path: 'pending-verification', 
				title: 'Pending Verification',
				component: PendingVerificationComponent,
			},
		]
	},
];
