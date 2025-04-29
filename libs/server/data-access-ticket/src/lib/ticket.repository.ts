import { Repository } from "typeorm";
import { Ticket } from "./ticket.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QrCodeTicketDto } from "./ticket.dto";
import { ticketDoesntExist } from "./ticket.exceptions";
import { TicketValidity } from "@paris-2024/shared-interfaces";

@Injectable()
export class TicketRepository {
  constructor(
    @InjectRepository(Ticket) 
    private ticketRepository: Repository<Ticket>,
  ) {}

  async create(dto: QrCodeTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(dto)
    return await this.ticketRepository.save(ticket);
  }

  async findOneById(id: Ticket['id']): Promise<Ticket | undefined> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: id }
    })
    if(!ticket) {
      ticketDoesntExist();
      return;
    }
    return ticket;
  }

  async findAllFromUser(userId: string): Promise<Array<Ticket>> {
    return await this.ticketRepository
      .createQueryBuilder('junction')
      .leftJoinAndSelect('user', 'user', 'junction.user_id = user.id')
      .where(`junction.user_id = :id::uuid`, { id: userId })
      .getMany();
  }

  async findValids() {
    return this.ticketRepository.find({
      where: { isValid: true }
    })
  }

  async isValid(userId: string, hashedToken: string): Promise<TicketValidity | null> {
    const result = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('user', 'user', 'ticket.user_id::uuid = user.id')
      .select([
        'ticket.is_valid AS "isValid"',
        'user.first_name AS "firstName"',
        'user.last_name AS "lastName"'
      ])
      .where('ticket.hashed_token = :hashedToken', { hashedToken })
      .andWhere('ticket.user_id::uuid = :userId::uuid', { userId })
      .getRawOne();
    
    if (!result) {
      ticketDoesntExist();
      return null;
    }
    
    return {
      isValid: result.isValid,
      userFullName: `${result.firstName} ${result.lastName}`
    };
  }

  async findAll(): Promise<Array<Ticket>> {
    return await this.ticketRepository.find();
  }
}
