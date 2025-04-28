import { IBase } from "./base.interface";
import { IBundle } from "./bundle.interface";
import { ITicket } from "./ticket.interface";

export interface IOrderEntity extends IBase {
  totalPrice: number;
  userId: string;
}

export interface IOrderModel extends IBase {
  bundles: Array<IBundle>;
  tickets: Array<ITicket>;
}

export interface IOrderTickets {
  orderId: string;
  totalPrice: number;
  userId: string;
  tickets: Array<ITicket>;
}
