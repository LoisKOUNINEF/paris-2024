import { IBase } from "./base.interface";

export interface IItemJunction extends IBase {
  quantity: number;
}

export interface IItemJunctionEntity extends IItemJunction {
  bundleId: string;
  cartId?: string;
  orderId?: string;
}

export interface IItemJunctionModel {
  junction: string,
  quantity: number;
  name: string;
  id: string;
  amount: number;
  price: number;
}
