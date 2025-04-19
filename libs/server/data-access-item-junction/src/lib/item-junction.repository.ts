import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemJunction } from './item-junction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemJunctionDto } from './item-junction.dto';

@Injectable()
export class ItemJunctionRepository {
  constructor(
    @InjectRepository(ItemJunction) 
    private itemJunctionRepository: Repository<ItemJunction>,
  ) {}
  
  async getManyByCartId(cartId: string): Promise<ItemJunction[]> {
    return await this.itemJunctionRepository.find({
      where: { cartId: cartId }
    });
  }

  async create(dto: ItemJunctionDto): Promise<ItemJunction> {
    const itemJunction = this.itemJunctionRepository.create(dto);
    return this.itemJunctionRepository.save(itemJunction);
  }

  async update(id: ItemJunction['id'], dto: ItemJunctionDto): Promise<ItemJunction | null> {
    const itemJunction = await this.itemJunctionRepository.findOne({
      where: { id: id }
    });

    if(!itemJunction) {
      return null;
    }

    await this.itemJunctionRepository.save(Object.assign(itemJunction, dto));
    return itemJunction;
  }

  async remove(id: ItemJunction['id']) {
    const itemJunction = await this.itemJunctionRepository.findOne({
      where: { id }
    });

    if (!itemJunction) return null;

    return await this.itemJunctionRepository.delete(itemJunction.id);
  }
}