import { IBase } from "./base.interface";
import { IBundle } from "./bundle.interface";

export interface ICartEntity extends IBase {
  guestToken: string | null;
  userId: string | null;
}

export interface ICartBundles {
  bundle: IBundle;
  quantity: number;
}

export interface ICartModel extends IBase {
  bundles: Array<ICartBundles>;
}

export interface ICartIdentifier {
  userId?: string; 
  guestToken?: string;
}
