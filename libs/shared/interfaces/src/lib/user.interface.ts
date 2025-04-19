import { IBase } from "./base.interface";
import { ICart } from "./cart.interface";
import { IOrder } from "./order.interface";
import { ITicket } from "./ticket.interface";

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

export interface IUserEntity extends IUser {
  cartId: string;
}

export interface IUserModel {
  cart: ICart,
  orders: Array<IOrder>,
  tickets: Array<ITicket>,
}
