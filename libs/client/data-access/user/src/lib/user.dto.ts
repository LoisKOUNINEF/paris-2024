import { IUser } from "@paris-2024/shared-interfaces";
import { User } from "./user.model";

export class UserDto implements Partial<IUser> {
	email?: User['email'];
	firstName?: User['firstName'];
	lastName?: User['lastName'];
	password?: User['password'];

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
