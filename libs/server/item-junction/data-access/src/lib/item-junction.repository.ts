import { Injectable } from '@nestjs/common';
import { DeleteResult, EntityManager, In, Repository } from 'typeorm';
import { ItemJunction } from './item-junction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemJunctionDto, UpdateItemJunctionDto } from './item-junction.dto';
import { IItemJunctionModel } from '@paris-2024/shared-interfaces';

// relies on the UQ_item_junction_cart_bundle constraint
const ADD_QUANTITY_ON_CONFLICT = `
  ON CONFLICT ("cart_id", "bundle_id")
  DO UPDATE SET "quantity" = "item_junction"."quantity" + EXCLUDED."quantity", "updated_at" = now()
`;

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
    // a cart only lists bundles that can still be bought, an order keeps the ones it was paid for
    const bundleJoinCondition = relationshipType === 'cart'
      ? 'item_junction.bundle_id::uuid = b.id AND b.deleted_at IS NULL AND b.is_available = true'
      : 'item_junction.bundle_id::uuid = b.id';

    const result = await this.itemJunctionRepository
      .createQueryBuilder('item_junction')
      .innerJoin('bundle', 'b', bundleJoinCondition)
      .select([
        'item_junction.id AS junction',
        'item_junction.quantity AS quantity',
        'b.name AS name',
        'b.id AS id',
        'b.ticket_amount AS amount',
        'b.price AS price',
      ])
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
      .leftJoinAndSelect('bundle', 'bundle', 'item_junction.bundle_id::uuid = bundle.id')
      .where('item_junction.id = :id::uuid', { id })
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
    const result = await this.itemJunctionRepository
      .createQueryBuilder('item_junction')
      .select('COALESCE(SUM(item_junction.quantity), 0)', 'sales')
      .where('item_junction.bundle_id = :id::uuid', { id: bundleId })
      .andWhere('item_junction.order_id IS NOT NULL')
      .getRawOne();

    // SUM returns a bigint, which pg hands back as a string
    return Number(result?.sales ?? 0);
  }

  async getAllWithSales(bundleIds: Array<string>): Promise<Record<string, number>> {
    interface BundleSales {
      bundleId: string;
      sales: string;
    };

    if (!bundleIds.length) {
      return {};
    }

    const rows: Array<BundleSales> = await this.itemJunctionRepository
      .createQueryBuilder('item_junction')
      .select('item_junction.bundle_id', 'bundleId')
      .addSelect('SUM(item_junction.quantity)', 'sales')
      .where('item_junction.bundle_id IN (:...ids)', { ids: bundleIds })
      .andWhere('item_junction.order_id IS NOT NULL')
      .groupBy('item_junction.bundle_id')
      .getRawMany();

    const salesByBundleId: Record<string, number> = {};
    bundleIds.forEach((id: string) => {
      salesByBundleId[id] = 0;
    });
    rows.forEach((row: BundleSales) => {
      salesByBundleId[row.bundleId] = Number(row.sales);
    });

    return salesByBundleId;
  }

  async updateQuantity(itemJunction: ItemJunction, quantity: number): Promise<ItemJunction> {
    if(quantity === 0) {
      await this.itemJunctionRepository.delete(itemJunction.id);
      return itemJunction;
    }

    await this.itemJunctionRepository.update(itemJunction.id, { quantity: quantity });
    return Object.assign(itemJunction, { quantity: quantity });
  }

  // moves every guest cart line into the user cart, adding quantities of bundles found in both
  async mergeJunctions(userCartId: string, guestCartId: string): Promise<void> {
    await this.itemJunctionRepository.manager.transaction(async (manager: EntityManager) => {
      await manager.query(`
        INSERT INTO "item_junction" ("cart_id", "bundle_id", "quantity")
        SELECT $1::uuid, "bundle_id", "quantity" FROM "item_junction" WHERE "cart_id" = $2::uuid
        ${ADD_QUANTITY_ON_CONFLICT}
      `, [userCartId, guestCartId]);

      await manager.getRepository(ItemJunction).delete({ cartId: guestCartId });
    });
  }

  async create(dto: CreateItemJunctionDto): Promise<ItemJunction | null> {
    if (dto.cartId) {
      // single statement: concurrent add-to-cart requests cannot create duplicate lines
      await this.itemJunctionRepository.query(`
        INSERT INTO "item_junction" ("cart_id", "bundle_id", "quantity")
        VALUES ($1::uuid, $2::uuid, $3)
        ${ADD_QUANTITY_ON_CONFLICT}
      `, [dto.cartId, dto.bundleId, dto.quantity]);

      return await this.getOne(dto.cartId, dto.bundleId);
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

  async remove(id: ItemJunction['id']): Promise<DeleteResult | null> {
    const result = await this.itemJunctionRepository.delete(id);
    return result.affected ? result : null;
  }

  // only moves junctions still in a cart, and returns the ones now attached to the order:
  // a concurrent order on the same cart gets fewer junctions back than it asked for
  async switchRelationship(
    ids: Array<ItemJunction['id']>,
    orderId: string,
    manager?: EntityManager,
  ): Promise<Array<ItemJunction>> {
    const repository = manager?.getRepository(ItemJunction) ?? this.itemJunctionRepository;
    const updateResult = await repository
      .createQueryBuilder()
      .update(ItemJunction)
      // TODO: remove 'as any' bypass
      .set({ cartId: null as any, orderId: orderId })
      .whereInIds(ids)
      .andWhere('cart_id IS NOT NULL')
      .execute();
    
    if (updateResult.affected && updateResult.affected > 0) {
      return await repository.findBy({
        id : In(ids),
        orderId: orderId,
      });
    }
    
    return [];
  }

  async delete(id: string) {
    return this.itemJunctionRepository.delete(id);
  }
}
