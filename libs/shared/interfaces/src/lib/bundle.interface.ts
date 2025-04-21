import { IBase } from "./base.interface";

export interface IBundle extends IBase {
  name: string;
  price: number;
  ticketAmount: number;
  isAvailable: boolean;
}
