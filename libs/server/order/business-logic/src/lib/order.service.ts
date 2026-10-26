import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { OnOrderMailerService } from '@paris-2024/server-business-logic-mailer';
import { StripeService } from '@paris-2024/server-business-logic-stripe';
import { TicketService } from '@paris-2024/server-business-logic-ticket';
import { UserService } from '@paris-2024/server-business-logic-user';
import { ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';
import { Order, OrderRepository } from '@paris-2024/server-data-access-order';
import { Ticket } from '@paris-2024/server-data-access-ticket';
import { User } from '@paris-2024/server-data-access-user';
import { ICartModel, IItemJunctionModel, IOrderTickets, IPaymentIntent } from '@paris-2024/shared-interfaces';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';

const CURRENCY = 'eur';
const UNIQUE_VIOLATION = '23505';

interface Checkout {
  cart: ICartModel;
  user: User;
  junctionItems: Array<IItemJunctionModel>;
  totalPrice: number;
  ticketAmount: number;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
    private ticketService: TicketService,
    private junctionRepository: ItemJunctionRepository,
    private onOrderMailer: OnOrderMailerService,
    private userService: UserService,
    private dataSource: DataSource,
    private stripeService: StripeService,
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

  // the amount to pay is always computed from the cart, never sent by the client
  async preparePayment(userId: string): Promise<IPaymentIntent> {
    const checkout = await this.loadCheckout(userId);

    if (checkout.junctionItems.length === 0) {
      throw new BadRequestException('cart is empty')
    }

    const { clientSecret } = await this.stripeService.createPaymentIntent(
      checkout.totalPrice,
      CURRENCY,
      { userId: checkout.user.id, cartId: checkout.cart.id },
    );

    if (!clientSecret) {
      throw new InternalServerErrorException('Error creating payment intent');
    }

    return { clientSecret, amount: checkout.totalPrice };
  }

  async create(userId: string, paymentIntentId: string): Promise<Order | undefined> {
    const existingOrder = await this.orderRepository.findByPaymentIntentId(paymentIntentId);
    if (existingOrder) {
      if (existingOrder.userId !== userId) {
        throw new BadRequestException('invalid payment');
      }
      // client retried after the order was created
      return existingOrder;
    }

    const amountReceived = await this.verifyPayment(userId, paymentIntentId);
    const checkout = await this.loadCheckout(userId);

    // the cart changed between payment intent creation and payment
    if (checkout.junctionItems.length === 0 || amountReceived !== checkout.totalPrice) {
      await this.refund(paymentIntentId);
      throw new ConflictException('cart changed during payment, the payment was refunded');
    }

    return await this.createPaidOrder(checkout, paymentIntentId);
  }

  // returns the amount actually paid
  private async verifyPayment(userId: string, paymentIntentId: string): Promise<number> {
    let paymentIntent;
    try {
      paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    } catch {
      throw new BadRequestException('invalid payment');
    }

    if (
      paymentIntent.status !== 'succeeded' ||
      paymentIntent.metadata?.['userId'] !== userId ||
      paymentIntent.currency !== CURRENCY
    ) {
      throw new BadRequestException('invalid payment');
    }

    return paymentIntent.amount_received;
  }

  private async refund(paymentIntentId: string): Promise<void> {
    try {
      await this.stripeService.refund(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to refund payment intent ${paymentIntentId}, refund it from the Stripe dashboard`, error);
    }
  }

  private async loadCheckout(userId: string): Promise<Checkout> {
    const cart = await this.cartService.getCartWithBundles({ userId });
    const user = await this.userService.getUserWithSecret(userId);

    if(!cart || !user) {
      throw new NotFoundException('no cart or no user')
    }

    const junctionItems = cart.bundles;

    return {
      cart,
      user,
      junctionItems,
      totalPrice: this.computeTotalPrice(junctionItems),
      ticketAmount: this.computeTotalTicketAmount(junctionItems),
    };
  }

  private async createPaidOrder(checkout: Checkout, paymentIntentId: string): Promise<Order> {
    const { user, junctionItems, totalPrice, ticketAmount } = checkout;
    const orderDto = {
      userId: user.id,
      totalPrice,
      paymentIntentId,
    };

    const junctionIds = junctionItems.map((junction: IItemJunctionModel) => junction.junction);

    // qr code generation is slow: keep it out of the transaction
    const preparedTickets = await this.ticketService.prepareTickets(
      { userId: user.id, userSecret: user.secretKey },
      ticketAmount,
    );

    let result: { newOrder: Order, tickets: Array<Ticket> };
    try {
      result = await this.dataSource.transaction(async (manager: EntityManager) => {
        const newOrder = await this.orderRepository.create(orderDto, manager);

        const ordered = await this.junctionRepository.switchRelationship(junctionIds, newOrder.id, manager);
        if (ordered.length !== junctionIds.length) {
          throw new ConflictException('cart items were already ordered');
        }

        const tickets = await this.ticketService.saveTickets(preparedTickets, newOrder.id, manager);

        return { newOrder, tickets };
      });
    } catch (error) {
      // a concurrent request already created the order for this payment
      if (error instanceof QueryFailedError && (error.driverError as { code?: string })?.code === UNIQUE_VIOLATION) {
        throw new ConflictException('payment was already used for an order');
      }
      // another payment ordered the same cart items first: this payment bought nothing
      if (error instanceof ConflictException) {
        await this.refund(paymentIntentId);
      }
      throw error;
    }
    const { newOrder, tickets } = result;

    const qrCodes = tickets.map((ticket: Ticket) => ticket.qrCode);

    const mailParams = {
      qrCodes: qrCodes,
      orderId: newOrder.id,
      email: user.email,
      firstName: user.firstName,
    }
    // the order is committed at this point: a mail failure must not fail it,
    // tickets stay available on the order page
    try {
      await this.onOrderMailer.sendTickets(mailParams);
    } catch (error) {
      this.logger.error(`Failed to send tickets of order ${newOrder.id}`, error);
    }
    return newOrder;
  }

  private computeTotalTicketAmount(itemJunctions: Array<IItemJunctionModel>): number {
    return itemJunctions.reduce((acc: number, junction: IItemJunctionModel) => {
      return acc + junction.quantity * junction.amount
    }, 0)
  }

  private computeTotalPrice(itemJunctions: Array<IItemJunctionModel>): number {
    return itemJunctions.reduce((acc: number, junction: IItemJunctionModel) => {
      return acc + junction.quantity * junction.price;
    }, 0)
  }
}
