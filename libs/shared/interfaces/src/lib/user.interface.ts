import { IBase } from "./base.interface";

export enum Roles {
  ADMIN = 'admin',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

export type RoleType = keyof typeof Roles;
export type RoleValue = `${Roles}`;

export interface IUser extends IBase {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
}
