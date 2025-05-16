import { IBase } from "./base.interface";

export interface ITicket extends IBase {
  qrCode: string;
  isValid: boolean;
  orderId: string;
  userId: string;
}

export interface TicketValidity {
  isValid: boolean;
  userFullName: string;
  createdAt: Date;
}
