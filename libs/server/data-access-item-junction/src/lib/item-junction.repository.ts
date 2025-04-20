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
      .createQueryBuilder('junction')
      .leftJoinAndSelect('bundle', 'bundle', 'junction.bundleId = bundle.id')
      .where(`junction.${relationshipType}Id = :relationshipId`, { relationshipId })
      .getRawMany();
  }

  async getOneWithBundle(id: ItemJunction['id']): Promise<IItemJunctionModel | undefined> {
    return await this.itemJunctionRepository
      .createQueryBuilder('junction')
      .leftJoinAndSelect('bundle', 'bundle', 'junction.bundleId = bundle.id')
      .where('junction.id = :junctionId', { id })
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
      .where('item_junction.bundleId = :id', { id: bundleId })
      .andWhere('item_junction.orderId != null')
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
      .select(['item_junction.bundleId', 'item_junction.quantity'])
      .where('item_junction.bundleId IN (:...ids)', { ids: bundleIds })
      .andWhere('item_junction.orderId IS NOT NULL')
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
    return this.itemJunctionRepository.save(itemJunction);
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
}
