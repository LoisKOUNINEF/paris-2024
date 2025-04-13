import { User } from "./user.model";

export class UserDto {
	email?: User['email'] | undefined;
	firstName?: User['firstName'] | undefined;
	lastName?: User['lastName'] | undefined;
	password?: User['password'] | undefined;

	constructor(formValue: UserFormValue) {
		this.email = formValue.email;
		this.firstName = formValue.firstName;
		this.lastName = formValue.lastName;
		this.password = formValue.password;
	}
}

export interface UserFormValue {
	email?: User['email'];
	firstName?: User['firstName'];
	lastName?: User['lastName'];
	password?: User['password'];
}
