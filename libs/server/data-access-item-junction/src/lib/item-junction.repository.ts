import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemJunction } from './item-junction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemJunctionDto, UpdateItemJunctionDto } from './item-junction.dto';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';

@Injectable()
export class ItemJunctionRepository {
  constructor(
    @InjectRepository(ItemJunction) 
    private itemJunctionRepository: Repository<ItemJunction>,
  ) {}
  
  async getManyByRelationshipId(
    relationshipType: 'cart' | 'order',
    relationshipId: string
  ): Promise<Array<IItemJunctionModel>> {
    const result = await this.itemJunctionRepository
      .createQueryBuilder('item_junction')
      .leftJoin('bundle', 'b', 'item_junction.bundle_id::uuid = b.id')
      .select([
        'item_junction.id AS junction',
        'item_junction.quantity AS quantity',
        'b.name AS name',
        'b.id AS id',
        'b.ticket_amount AS amount',
        'b.price AS price',
      ])
      // .leftJoinAndSelect('bundle', 'b', 'item_junction.bundle_id::uuid = b.id')
      // .addSelect(['b.id', 'b.name', 'b.ticket_amount'])
      .where(`item_junction.${relationshipType}_id::uuid = :relationshipId::uuid`, { relationshipId })
      .getRawMany();

      const output = result.map((junction) => {
        return {
          junction: junction.junction,
          id: junction.id,
          name: junction.name,
          amount: junction.amount,
          price: junction.price,
          quantity: junction.quantity,}
        }
      );
      return output;
  }

  async getOneWithBundle(id: ItemJunction['id']): Promise<IItemJunctionModel | undefined> {
    return await this.itemJunctionRepository
      .createQueryBuilder('item_junction')
      .leftJoinAndSelect('bundle', 'bundle', 'junction.bundle_id::uuid = bundle.id')
      .where('junction.id = :id::uuid', { id })
      .getOne() as unknown as IItemJunctionModel;
  }

  async getOne(cartId: string, bundleId: string) {
    return await this.itemJunctionRepository.findOne({
      where: { 
        cartId: cartId, 
        bundleId: bundleId 
      }
    })
  }

  async getOneWithSales(bundleId: string): Promise<number> {
    const itemJunctions = await this.itemJunctionRepository
      .createQueryBuilder('junction')
      .select('item_junction')
      .where('item_junction.bundle_id = :id::uuid', { id: bundleId })
      .andWhere('item_junction.order_id != null')
      .getMany();

    const sales = itemJunctions.reduce((acc: number, sale: ItemJunction) => {
      return acc += sale.quantity
    }, 0);

    return sales;
  }

  async getAllWithSales(bundleIds: Array<string>): Promise<Record<string, number>> {
    if (!bundleIds.length) {
      return {};
    }

    const itemJunctions = await this.itemJunctionRepository
      .createQueryBuilder('junction')
      .select(['item_junction.bundle_id', 'item_junction.quantity'])
      .where('item_junction.bundle_id IN (:...ids)::uuid', { ids: bundleIds })
      .andWhere('item_junction.order_id IS NOT NULL')
      .getRawMany();

    const salesByBundleId = itemJunctions.reduce((acc: Record<string, number>, sale: any) => {
      const bundleId = sale.item_junction_bundleId;
      if (!acc[bundleId]) {
        acc[bundleId] = 0;
      }
      acc[bundleId] += sale.item_junction_quantity;
      return acc;
    }, {});

    bundleIds.forEach(id => {
      if (salesByBundleId[id] === undefined) {
        salesByBundleId[id] = 0;
      }
    });

    return salesByBundleId;
  }


  async updateQuantity(id: ItemJunction['id'], quantity: number): Promise<ItemJunction | null> {
    const itemJunction = await this.itemJunctionRepository.findOne({ 
      where: { id: id } 
    });
    
    if (!itemJunction) {
      return null;
    }
    if(quantity === 0) {
      await this.remove(id);
      return itemJunction;
    }
    
    await this.itemJunctionRepository.save(Object.assign(itemJunction, { quantity: quantity }));
    return itemJunction;
  }

  async mergeJunctions(
    userCartId: string,
    guestJunctions: Array<IItemJunctionModel>, 
    userJunctions: Array<IItemJunctionModel>,
  ): Promise<void> {
    const userJunctionMap = new Map<string, IItemJunctionModel>();
    userJunctions.forEach((junction: IItemJunctionModel) => {
      userJunctionMap.set(junction.id, junction);
    });
      
    for (const guestJunction of guestJunctions) {
      const userJunction = userJunctionMap.get(guestJunction.id);

      if (userJunction) {
        const newQuantity = userJunction.quantity + guestJunction.quantity;
        await this.update(userJunction.junction, {
          quantity: newQuantity,
        });
      } else {
        await this.create({
          cartId: userCartId,
          bundleId: guestJunction.id,
          quantity: guestJunction.quantity
        });
      }
    }
    for (const guestJunction of guestJunctions) {
      await this.delete(guestJunction.junction);
    }
  }

  async create(dto: CreateItemJunctionDto): Promise<ItemJunction | null> {
    if (dto.cartId) {
      const alreadyExists = await this.getOne(dto.cartId, dto.bundleId);
      if (alreadyExists) {
        const updatedQuantity = dto.quantity + alreadyExists.quantity;
        return await this.updateQuantity(alreadyExists.id, updatedQuantity);
      }
    }
    
    const itemJunction = this.itemJunctionRepository.create(dto);
    return await this.itemJunctionRepository.save(itemJunction);
  }

  async update(id: ItemJunction['id'], dto: UpdateItemJunctionDto): Promise<ItemJunction | null> {
    const itemJunction = await this.itemJunctionRepository.findOne({
      where: { id: id }
    });

    if(!itemJunction) {
      return null;
    }

    return await this.itemJunctionRepository.save(Object.assign(itemJunction, dto));
  }

  async remove(id: ItemJunction['id']) {
    const itemJunction = await this.itemJunctionRepository.findOne({
      where: { id }
    });

    if (!itemJunction) return null;

    return await this.itemJunctionRepository.delete(itemJunction.id);
  }

  async switchRelationship(ids: Array<ItemJunction['id']>, orderId: string): Promise<Array<ItemJunction> | null> {
    const updateResult = await this.itemJunctionRepository
      .createQueryBuilder()
      .update(ItemJunction)
      // TODO: remove 'as any' bypass
      .set({ cartId: null as any, orderId: orderId })
      .whereInIds(ids)
      .execute();
    
    if (updateResult.affected && updateResult.affected > 0) {
      return await this.itemJunctionRepository.findByIds(ids);
    }
    
    return [];
  }

  async delete(id: string) {
    return this.itemJunctionRepository.delete(id);
  }
}
