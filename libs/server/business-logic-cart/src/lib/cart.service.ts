import { Injectable } from '@nestjs/common';
import { CartRepository, Cart, AddToCartDto, noIdentifierProvided } from '@paris-2024/server-data-access-cart';
import { CreateItemJunctionDto, ItemJunction, ItemJunctionRepository } from '@paris-2024/server-data-access-item-junction';
import { ICartIdentifier, ICartModel, IItemJunctionModel } from '@paris-2024/shared-interfaces';
import { DeleteResult } from 'typeorm';

@Injectable()
export class CartService {
	constructor( 
		private cartRepository: CartRepository,
		private itemJunctionRepository: ItemJunctionRepository,	) {}

	async getCartWithBundles(identifier: ICartIdentifier): Promise<ICartModel | null> {
	  const cart = await this.cartRepository.getCart(identifier);
	  if (!cart) {
	    return null;
	  }
	  
	  const bundles: Array<IItemJunctionModel> = await this.itemJunctionRepository.getManyByRelationshipId('cart', cart.id);

	  if (bundles.length === 0) {
	    return {...cart, bundles: [] };
	  }
	  
	  return {
	    ...cart,
	    bundles
	  };
	}

	async mergeGuestCartWithUserCart(identifiers: Required<ICartIdentifier>): Promise<Cart | null> {
	  const userCart = await this.cartRepository.getUserCart(identifiers.userId);
	  
	  const guestCart = await this.cartRepository.getGuestCart(identifiers.guestToken)

	  if (!guestCart) {
	    return userCart || await this.cartRepository.createUserCart(identifiers.userId);
	  }

	  if (!userCart) {
	  	const cartDto = {
	    	userId: identifiers.userId,
	    	guestToken: null,
	  	}
	    return await this.cartRepository.update(guestCart.id, cartDto);
	  }

	  const guestJunctions = await this.itemJunctionRepository.getManyByRelationshipId('cart', guestCart.id);
	  const userJunctions = await this.itemJunctionRepository.getManyByRelationshipId('cart', userCart.id);

	  await this.itemJunctionRepository.mergeJunctions(userCart.id, guestJunctions, userJunctions);

	  await this.cartRepository.delete(guestCart.id);

	  return userCart;
	}

	async addToCart(
		identifier: ICartIdentifier, 
		dto: CreateItemJunctionDto,
	): Promise<ItemJunction | undefined> {
		let cart = await this.cartRepository.getCart(identifier);
		if (!cart) {
	    if (identifier.userId) {
	      cart = await this.cartRepository.createUserCart(identifier.userId);
	    } else if (identifier.guestToken) {
	      cart = await this.cartRepository.createGuestCart(identifier.guestToken);
	    } else {
	      noIdentifierProvided();
	      return;
    	}
		}
		dto  = { ...dto, cartId: cart.id};
		return await this.itemJunctionRepository.create(dto);	
	}

	async removeFromCart(cartId: Cart['id'], bundleId: string): Promise<DeleteResult | null> {
		const itemJunction = await this.itemJunctionRepository.getOne(cartId, bundleId);

		if (itemJunction) {
			return await this.itemJunctionRepository.remove(itemJunction.id);
		}
		return null;
	}

	async updateItemQuantity(identifier: ICartIdentifier, dto: AddToCartDto): Promise<ItemJunction | null> {
		const cart = await this.cartRepository.getCart(identifier);
		if (!cart) return null;

		const itemJunction = await this.itemJunctionRepository.getOne(cart.id, dto.bundleId);

		if (itemJunction) {
			return await this.itemJunctionRepository.updateQuantity(itemJunction.id, dto.quantity)
		}
		return null;
	}

	async createUserCart(userId: string): Promise<Cart | undefined> {
		return await this.cartRepository.createUserCart(userId);
	}

	async createGuestCart(guestToken: string): Promise<Cart | undefined> {
		return await this.cartRepository.createGuestCart(guestToken);	
	}

	// async getCart(identifiers: ICartIdentifier): Promise<Cart | null> {
	// 	return await this.cartRepository.getCart(identifiers);
	// }
}
