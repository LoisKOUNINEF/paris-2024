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
    return await this.itemJunctionRepository
      .createQueryBuilder('item_junction')
      .leftJoinAndSelect('bundle', 'bundle', 'item_junction.bundle_id::uuid = bundle.id::uuid')
      .where(`item_junction.${relationshipType}_id::uuid = :relationshipId::uuid`, { relationshipId })
      .getRawMany();
  }

  async getOneWithBundle(id: ItemJunction['id']): Promise<IItemJunctionModel | undefined> {
    return await this.itemJunctionRepository
      .createQueryBuilder('item_junction')
      .leftJoinAndSelect('bundle', 'bundle', 'junction.bundle_id::uuid = bundle.id')
      .where('junction.id = :id::uuid', { id })
      .getRawOne();
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
      .where('item_junction.bundle_id::uuid = :id::uuid', { id: bundleId })
      .andWhere('item_junction.order_id::uuid != null')
      .getRawMany();

    const sales = itemJunctions.reduce((acc: any, sale: ItemJunction) => {
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
    
    await this.itemJunctionRepository.save(Object.assign(itemJunction, { quantity: quantity }));
    return itemJunction;
  }

  async mergeJunctions(
    guestJunctions: Array<IItemJunctionModel>, 
    userJunctions: Array<IItemJunctionModel>,
  ): Promise<void> {
    const userJunctionMap = new Map<string, IItemJunctionModel>();
    userJunctions.forEach((junction: IItemJunctionModel) => {
      userJunctionMap.set(junction.bundle.id, junction);
    });
    
    for (const junction of guestJunctions) {
      const userJunction = userJunctionMap.get(junction.bundle.id);

      if(userJunction) {
        const quantity = userJunction.quantity + junction.quantity;
        const dto = {
          quantity: quantity,
        }
        await this.update(userJunction.id, dto);
      }
    }
  }

  async create(dto: CreateItemJunctionDto): Promise<ItemJunction> {
    if (dto.cartId) {
      const alreadyExists = await this.getOne(dto.cartId, dto.bundleId);
      if (alreadyExists) {
        await this.updateQuantity(alreadyExists.id, dto.quantity)
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
}
