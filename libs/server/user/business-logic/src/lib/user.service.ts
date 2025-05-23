import { Injectable } from '@nestjs/common';
import { ICartIdentifier, Roles, RoleValue } from '@paris-2024/shared-interfaces';
import { UserRepository, CreateUserDto, User, UpdateUserDto } from '@paris-2024/server-data-access-user';
import { WelcomeMailerService, EmailValidationMailerService } from '@paris-2024/server-business-logic-mailer';
import { CartService } from '@paris-2024/server-business-logic-cart';
import { Cart } from '@paris-2024/server-data-access-cart';

@Injectable()
export class UserService {
	constructor( 
		private userRepository: UserRepository,
		private welcomeMailerService: WelcomeMailerService,
		private emailValidationService: EmailValidationMailerService,
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

		await this.emailValidationService.sendValidationLink(        {
			email: createdUser.email,
      emailVerificationToken: createdUser.emailVerificationToken
    });		
		await this.welcomeMailerService.sendWelcome(createdUser.email);
	
		return createdUser;
	}

	async verifyEmail(token: string): Promise<User | null> {
		return await this.userRepository.verifyEmail(token);
	}

	async update(id: User['id'], dto: UpdateUserDto): Promise<User | null> {
		return await this.userRepository.update(id, dto);
	}

	async delete(id: User['id']): Promise<User | undefined> {
		return await this.userRepository.remove(id);
	}

	private async linkCart(identifiers: Required<ICartIdentifier>): Promise<Cart | null> {
		return await this.cartService.mergeGuestCartWithUserCart(identifiers);
	}
}