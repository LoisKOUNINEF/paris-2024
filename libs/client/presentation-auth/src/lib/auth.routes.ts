import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";

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
		]
	},
];
