import { Injectable } from '@nestjs/common';
import { ICartIdentifier, Roles, RoleValue } from '@paris-2024/shared-interfaces';
import { UserRepository, CreateUserDto, User } from '@paris-2024/server-data-access-user';
import { WelcomeMailerService } from '@paris-2024/server-business-logic-mailer';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { Cart } from '@paris-2024/server-data-access-cart';

@Injectable()
export class UserService {
	constructor( 
		private userRepository: UserRepository,
		private welcomeMailerService: WelcomeMailerService,
		private cartService: CartService,
	) {}

	async findAll(role?: RoleValue): Promise<Array<User>> {
		if (role) {
			return await this.userRepository.findByRole(role);
		}

		return await this.userRepository.findUsers();
	}

	async findOne(id: string): Promise<User | undefined> {
		return this.userRepository.findOneById(id);
	}

	async getUserWithSecret(id: string): Promise<User | undefined> {
		return this.userRepository.getUserWithSecret(id);
	}

	async create(createUserDto: CreateUserDto, isAdmin: boolean, guestToken?: string): Promise<User | undefined> {
		const role = isAdmin ? Roles.STAFF : Roles.CUSTOMER;
		const dto = { 
			...createUserDto,
			role: role,
		};

		const createdUser = await this.userRepository.create(dto);

		if (!createdUser) { return }

		if (!guestToken) {
			const cart = await this.cartService.createUserCart(createdUser.id);
			if (cart) {
				dto.cartId = cart.id;
			}
		} else {
			const cart = await this.cartService.getCartWithBundles({guestToken});
			if (cart) {
				dto.cartId = cart.id;
				this.linkCart({ userId: createdUser.id, guestToken: guestToken })
			} 
		}
		
		await this.welcomeMailerService.sendWelcome(createdUser.email);
	
		return createdUser;
	}

	private async linkCart(identifiers: Required<ICartIdentifier>): Promise<Cart | null> {
		return await this.cartService.mergeGuestCartWithUserCart(identifiers);
	}
}