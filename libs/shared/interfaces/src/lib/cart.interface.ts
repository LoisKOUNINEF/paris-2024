import { IBase } from "./base.interface";

export interface ICart extends IBase {
  totalPrice: number;
  guestToken: string | null;
  userId: string | null;
}
