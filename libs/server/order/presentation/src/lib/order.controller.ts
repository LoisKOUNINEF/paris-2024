import { Body, Controller, Get, UseGuards, Request, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { OrderService } from "@paris-2024/server-business-logic-order";
import { Admin, AuthenticatedGuard, Owner, CurrentUser, CurrentEntity, OwnerCheck } from '@paris-2024/server-business-logic-guards';
import { NewOrderDto, Order } from "@paris-2024/server-data-access-order";
import { RequestWithUser } from "@paris-2024/server-base-entity";
import { IOrderTickets, IPaymentIntent } from "@paris-2024/shared-interfaces";

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Admin(true)
  @ApiOkResponse({
    type: Order,
    isArray: true,
    description: 'returns all orders',
  })
  getAll(): Promise<Array<Order>> {
    return this.orderService.getAll();
  }

  @Get('user-orders')
  @ApiOkResponse({
    type: Order,
    isArray: true,
    description: 'returns all orders from user',
  })
  @Owner({
    entityService: OrderService,
    findMethod: 'findAll',
    findByUserMethod: 'getAllFromUser',
    ownershipField: 'userId',
    useCurrentUser: true,
  })
  // OwnerGuard is global (APP_GUARD): it already loaded the orders, do not fetch them again
  @OwnerCheck(true)
  getUserOrders(
    @CurrentUser() user: RequestWithUser["user"],
    @CurrentEntity() orders: Array<Order>,
  ): Array<Order> {
    const userId = user?.id;
    if (!userId) {
      throw new HttpException('You must be logged in to gain access to this page', HttpStatus.BAD_REQUEST);
    }
    return orders;
  }

  @Get(':id')
  @ApiOkResponse({
    type: Order,
    description: 'returns designated order',
  })  
  @Owner({
    paramKey: 'id',
    entityService: OrderService,
    findMethod: 'findOneById',
    ownershipField: 'userId',
  })
  @OwnerCheck(true)
  getOrder(
    @CurrentUser() user: RequestWithUser["user"],
    @CurrentEntity() order: Order,
  ): IOrderTickets {
    return order as unknown as IOrderTickets;
  }

  @Post('payment-intent')
  @UseGuards(AuthenticatedGuard)
  @ApiCreatedResponse({
    description: 'creates a payment intent for the amount of the user cart',
  })
  @ApiBadRequestResponse({ description: 'cart is empty' })
  createPaymentIntent(@Request() req: RequestWithUser): Promise<IPaymentIntent> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('You must be logged in to gain access to this page', HttpStatus.BAD_REQUEST);
    }
    return this.orderService.preparePayment(userId);
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  @ApiBody({ type: NewOrderDto })
  @ApiCreatedResponse({
    type: Order,
    description: 'creates an order from the user cart once its payment succeeded',
  })
  @ApiBadRequestResponse({ description: 'payment is missing, not succeeded or not owned by the user' })
  @ApiConflictResponse({ description: 'cart changed during payment (refunded) or payment already used' })
  create(@Request() req: RequestWithUser, @Body() dto: NewOrderDto): Promise<Order | undefined> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('You must be logged in to gain access to this page', HttpStatus.BAD_REQUEST);
    }
    return this.orderService.create(userId, dto.paymentIntentId);
  }
}