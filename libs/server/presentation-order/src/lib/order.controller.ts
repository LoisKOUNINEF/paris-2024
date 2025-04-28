import { Controller, Get, UseGuards, Request, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { OrderService } from "@paris-2024/server-business-logic-order";
import { Admin, AuthenticatedGuard, Owner } from '@paris-2024/server-business-logic-guards';
import { Order } from "@paris-2024/server-data-access-order";
import { RequestWithUser } from "@paris-2024/server-base-entity";
import { IOrderTickets } from "@paris-2024/shared-interfaces";

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
  @Owner(true)
  @ApiOkResponse({
    type: Order,
    isArray: true,
    description: 'returns all orders from user',
  })
  getUserOrders(@Request() req: RequestWithUser): Promise<Array<Order> | undefined> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('You must be logged in to gain access to this page', HttpStatus.BAD_REQUEST);
    }
    return this.orderService.getAllFromUser(userId);
  }

  @Get(':id')
  // @Owner(true)
  @ApiOkResponse({
    type: Order,
    description: 'returns designated order',
  })
  getOne(@Param('id') orderId: Order['id']): Promise<IOrderTickets | null> {
    return this.orderService.findOneById(orderId);
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  @ApiCreatedResponse({
    type: Order,
    description: 'creates an order',
  })
  create(@Request() req: RequestWithUser): Promise<Order | undefined> {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('You must be logged in to gain access to this page', HttpStatus.BAD_REQUEST);
    }
    return this.orderService.create(userId);
  }
}