import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { Repository } from "typeorm";
import { CreateOrderDto } from "./order.dto";
import { IOrderTickets } from "@paris-2024/shared-interfaces";

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order) 
    private orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Array<Order>> {
    return this.orderRepository.find();
  }

  async findOneById(id: Order['id']): Promise<IOrderTickets | null> {
    const raw = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'order.id AS "orderId"',
        'order.total_price AS "totalPrice"',
        'order.user_id AS "userId"',
        `
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', ticket.id,
              'qrCode', ticket.qr_code,
              'isValid', ticket.is_valid,
              'orderId', ticket.order_id,
              'userId', ticket.user_id,
              'createdAt', ticket.created_at,
              'updatedAt', ticket.updated_at
            )
          ) FILTER (WHERE ticket.id IS NOT NULL),
          '[]'
        ) AS "tickets"
        `,
      ])
      .leftJoin('Ticket', 'ticket', 'ticket.order_id::uuid = order.id')
      .where('order.id = :id::uuid', { id })
      .groupBy('order.id')
      .getRawOne();

    if (!raw) {
      return null;
    }

    return {
      orderId: raw.orderId,
      totalPrice: Number(raw.totalPrice),
      userId: raw.userId,
      tickets: raw.tickets,
    };
  }



  async findByUserId(userId: string): Promise<Array<Order>> {
    return await this.orderRepository.find({
      where: { userId: userId }
    })
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const newOrder = await this.orderRepository.create(dto);
    return await this.orderRepository.save(newOrder);
  }

}