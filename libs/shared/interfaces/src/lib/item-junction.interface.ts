import { IBase } from "./base.interface";
import { IBundle } from "./bundle.interface";

export interface IItemJunction extends IBase {
  quantity: number;
}

export interface IItemJunctionEntity extends IItemJunction {
  bundleId: string;
  cartId?: string;
  orderId?: string;
}

export interface IItemJunctionModel extends IItemJunction {
  bundle: IBundle;
}
