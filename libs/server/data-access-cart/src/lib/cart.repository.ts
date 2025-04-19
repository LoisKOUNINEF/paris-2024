import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCartDto } from './cart.dto';

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart) 
    private cartRepository: Repository<Cart>,
  ) {}

  async createGuestCart(guestToken: string): Promise<Cart> {
    const cart = this.cartRepository.create({ guestToken });
    return this.cartRepository.save(cart);
  }

  async createUserCart(userId: string): Promise<Cart> {
    const cart = this.cartRepository.create({ userId });
    return this.cartRepository.save(cart);
  }

  async getGuestCart(guestToken: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: { guestToken },
    });
  }

  async getUserCart(userId: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
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
}
