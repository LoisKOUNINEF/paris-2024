import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ICartIdentifier } from '@paris-2024/shared-interfaces';
import { Cart } from './cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCartDto } from './cart.dto';
import { noIdentifierProvided } from './cart.exceptions';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart) 
    private cartRepository: Repository<Cart>,
  ) {}

  async getCart(identifier: ICartIdentifier): Promise<Cart | null> {
    if (identifier.userId) {
      const userCart = await this.getUserCart(identifier.userId)
      if (userCart) {
        return userCart;
      } else {
        return this.createUserCart(identifier.userId);
      }
    }

    if (identifier.guestToken) {
      return await this.getGuestCart(identifier.guestToken);
    }

    noIdentifierProvided();
    return null;
  }

  async createGuestCart(guestToken: string): Promise<Cart> {
    const alreadyExists = await this.getGuestCart(guestToken);
    if (alreadyExists) {
      return alreadyExists;
    };
    const cart = this.cartRepository.create({ guestToken });
    return this.cartRepository.save(cart);
  }

  async createUserCart(userId: string): Promise<Cart> {
    const alreadyExists = await this.getUserCart(userId);
    if (alreadyExists) {
      return alreadyExists;
    }
    const cart = this.cartRepository.create({ userId });
    return this.cartRepository.save(cart);
  }

  async getGuestCart(guestToken: string): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { guestToken },
    });
  }

  async getUserCart(userId: string): Promise<Cart | null> {
    return await this.cartRepository.findOne({
      where: { userId },
    });
  }

  async getCartById(id: Cart['id']): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: { id },
    });
  }

  async update(id: Cart['id'], cartDto: UpdateCartDto): Promise<Cart | null> {
    const cart = await this.cartRepository.findOne({
      where: { id: id }
    });

    if(!cart) {
      return null;
    }

    await this.cartRepository.save(Object.assign(cart, cartDto));
    return cart;
  }

  async delete(id: string) {
    return await this.cartRepository.delete(id);
  }
}
