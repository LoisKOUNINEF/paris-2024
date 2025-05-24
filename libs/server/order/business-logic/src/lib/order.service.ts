import { Injectable, NotFoundException } from '@nestjs/common';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { OnOrderMailerService } from '@paris-2024/server-business-logic-mailer';
import { TicketService } from '@paris-2024/server-business-logic-ticket';
import { UserService } from '@paris-2024/server-business-logic-user';
import { ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';
import { Order, OrderRepository } from '@paris-2024/server-data-access-order';
import { Ticket, TicketDto } from '@paris-2024/server-data-access-ticket';
import { IItemJunctionModel, IOrderTickets } from '@paris-2024/shared-interfaces';

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
    private ticketService: TicketService,
    private junctionRepository: ItemJunctionRepository,
    private onOrderMailer: OnOrderMailerService,
    private userService: UserService,
  ) {}

  async findOneById(id: Order['id']): Promise<IOrderTickets | null> {
    return await this.orderRepository.findOneById(id);
  }

  async getAllFromUser(userId: string): Promise<Array<Order> | undefined> {
    return await this.orderRepository.findByUserId(userId);
  }

  async getAll(): Promise<Array<Order>> {
    return await this.orderRepository.findAll();
  }

  async create(userId: string): Promise<Order | undefined> {
    const cart = await this.cartService.getCartWithBundles({ userId });
    const user = await this.userService.getUserWithSecret(userId);

    if(!cart || !user) {
      throw new NotFoundException('no cart or no user')
    }

    const junctionItems = await this.junctionRepository.getManyByRelationshipId('cart', cart.id);

    const ticketAmount = this.computeTotalTicketAmount(junctionItems)
    const totalPrice = this.computeTotalPrice(junctionItems);
    const orderDto = {
      userId: user.id,
      totalPrice,
    };

    const newOrder = await this.orderRepository.create(orderDto);
    const junctionIds = junctionItems.reduce((acc: Array<string>, junction: IItemJunctionModel) => {
      acc.push(junction.junction);
      return acc;
    }, []);
    await this.junctionRepository.switchRelationship(junctionIds, newOrder.id);

    const ticketDto = { 
      userId: userId, 
      orderId: newOrder.id, 
      userSecret: user.secretKey 
    };
    
    const tickets = await this.generateTickets(ticketAmount, ticketDto);
    const qrCodes = tickets.map((ticket: Ticket) => ticket.qrCode);

    const mailParams = {
      qrCodes: qrCodes,
      orderId: newOrder.id,
      email: user.email,
      firstName: user.firstName,
    }
    await this.onOrderMailer.sendTickets(mailParams);
    return newOrder;
  }

  private async generateTickets(ticketAmount: number, ticketDto: Pick<TicketDto, 'userId' | 'userSecret' | 'orderId'>): Promise<Array<Ticket>> {
    const tickets: Array<Ticket> = [];

    for (let i = 0; i < ticketAmount; i++) {
      const ticket = await this.ticketService.createTicket(ticketDto);
      if (ticket) tickets.push(ticket);
    }
    return tickets;
  }

  private computeTotalTicketAmount(itemJunctions: Array<IItemJunctionModel>): number {
    return itemJunctions.reduce((acc: number, junction: IItemJunctionModel) => {
      return (acc += junction.quantity * junction.amount)
    }, 0)
  }

  private computeTotalPrice(itemJunctions: Array<IItemJunctionModel>): number {
    return itemJunctions.reduce((acc: number, junction: IItemJunctionModel) => {
      return acc += junction.quantity * junction.price;
    }, 0)
  }
}