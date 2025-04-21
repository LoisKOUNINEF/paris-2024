import { IBase } from "./base.interface";

export interface ITicket extends IBase {
  qrCode: string;
  isValid: boolean;
  orderId: string;
  userId: string;
}
