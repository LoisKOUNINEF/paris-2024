import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemJunctionRepository } from './item-junction.repository';
import { ItemJunction } from './item-junction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemJunction])],
  providers: [ItemJunctionRepository],
  exports: [ItemJunctionRepository, TypeOrmModule],
})
export class DataAccessItemJunctionModule {}
