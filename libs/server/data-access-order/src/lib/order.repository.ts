import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { Repository } from "typeorm";
import { CreateOrderDto } from "./order.dto";

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order) 
    private orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Array<Order>> {
    return this.orderRepository.find();
  }

  async findOneById(id: Order['id']): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { id: id }
    })
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