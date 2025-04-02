import { IUser, Roles } from '@paris-2024/shared-interfaces';
import { BaseModel } from '@paris-2024/client-data-access-core';

export class User extends BaseModel implements IUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Roles;
  cartId: string;

  constructor(
    email: User['email'],
    firstName: User['firstName'],
    lastName: User['lastName'],
    password: User['password'],
    role: User['role'],
  ) {
    super();
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.role = role;
  }
}
