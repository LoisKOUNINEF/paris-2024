import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketRepository } from './ticket.repository';
import { Ticket } from './ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketRepository],
  exports: [TicketRepository, TypeOrmModule],
})
export class DataAccessTicketModule {}
