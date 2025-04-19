import { IBase } from "./base.interface";

export interface IItemJunction extends IBase {
  quantity: number;
  subTotal: number;
  bundleId: string;
  cartId?: string;
  orderId?: string;
}
