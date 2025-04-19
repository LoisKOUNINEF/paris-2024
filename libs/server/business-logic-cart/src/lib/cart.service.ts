import { Injectable } from '@nestjs/common';
import { CartRepository, Cart } from '@paris-2024/server-data-access-cart';
import { ItemJunction, ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';
import { ICartModel, IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { DeleteResult } from 'typeorm';

@Injectable()
export class CartService {
	constructor( 
		private cartRepository: CartRepository,
		private itemJunctionRepository: ItemJunctionRepository,	) {}

	async getCartWithBundles(identifier: { userId?: string, guestToken?: string}): Promise<ICartModel | null> {
	  const cart = await this.cartRepository.getCart(identifier);
	  
	  if (!cart) {
	    return null;
	  }
	  
	  const junctions: Array<IItemJunctionModel> = await this.itemJunctionRepository.getManyByRelationshipId('cart', cart.id);
	  
	  if (junctions.length === 0) {
	    return { ...cart, bundles: [] };
	  }
	  
	  const bundles = junctions.map((junction: IItemJunctionModel) => junction.bundle);
	  
	  return {
	    ...cart,
	    bundles: bundles
	  };
	}

	async mergeGuestCartWithUserCart(userId: string, guestToken: string): Promise<Cart | null> {
	  const userCart = await this.cartRepository.getUserCart(userId);
	  
	  const guestCart = await this.cartRepository.getGuestCart(guestToken)

	  if (!guestCart) {
	    return userCart || await this.cartRepository.createUserCart(userId);
	  }

	  if (!userCart) {
	  	const cartDto = {
	    	userId: userId,
	    	guestToken: undefined,
	  	}
	    return await this.cartRepository.update(guestCart.id, cartDto);
	  }

	  const guestJunctions = await this.itemJunctionRepository.getManyByRelationshipId('cart', guestCart.id);
	  const userJunctions = await this.itemJunctionRepository.getManyByRelationshipId('cart', userCart.id);

	  await this.itemJunctionRepository.mergeJunctions(guestJunctions, userJunctions);

	  await this.cartRepository.update(guestCart.id, { 
	  	guestToken: undefined, 
	  	userId: userId, 
	  });

	  return userCart;
	}

	async addToCart(cartId: Cart['id'], bundleId: string, quantity?: number): Promise<ItemJunction> {
		const dto = {
			cartId: cartId,
			bundleId: bundleId,
			quantity: quantity ? quantity : 1
		}
		return await this.itemJunctionRepository.create(dto);
	}

	async removeFromCart(cartId: Cart['id'], bundleId: string): Promise<DeleteResult | null> {
		const itemJunction = await this.itemJunctionRepository.getOne(cartId, bundleId);

		if (itemJunction) {
			return await this.itemJunctionRepository.remove(itemJunction.id);
		}
		return null;
	}

	async updateItemQuantity(cartId: Cart['id'], bundleId: string, quantity: number): Promise<void> {
		const itemJunction = await this.itemJunctionRepository.getOne(cartId, bundleId);

		if (itemJunction) {
			this.itemJunctionRepository.updateQuantity(itemJunction.id, quantity)
		}
	}

	async createGuestCart(guestToken: string): Promise<Cart> {
		return await this.cartRepository.createGuestCart(guestToken);
	}

	async createUserCart(userId: string): Promise<Cart> {
		return await this.cartRepository.createUserCart(userId);
	}
}
