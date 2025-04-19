import { IBase } from "./base.interface";
import { IBundle } from "./bundle.interface";

export interface ICart extends IBase {
  totalPrice: number;
}

export interface ICartEntity extends ICart {
  guestToken: string | null;
  userId: string | null;
}

export interface ICartModel extends ICart {
  bundles: Array<IBundle>;
}
