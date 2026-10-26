import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ICartIdentifier, Roles, RoleValue } from '@paris-2024/shared-interfaces';
import { UserRepository, CreateUserDto, User, UpdateUserDto, incorrectCurrentPassword } from '@paris-2024/server-data-access-user';
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
				await this.linkCart({ userId: createdUser.id, guestToken: guestToken })
			} 
		}

		await this.emailValidationService.sendValidationLink(        {
			email: createdUser.email,
      emailVerificationToken: createdUser.emailVerificationToken
    });
	
		return createdUser;
	}

	async verifyEmail(token: string): Promise<User | null> {
		const result = await this.userRepository.verifyEmail(token);
		if (result && !result.isEmailChange) {
			// the account only counts as created once its email is validated
			await this.welcomeMailerService.sendWelcome(result.user.email);
		}
		return result?.user ?? null;
	}

	async update(id: User['id'], dto: UpdateUserDto): Promise<User | null> {
		const { currentPassword, email, ...changes } = dto;
		const user = await this.userRepository.findOneById(id);
		if (!user) { return null }

		const emailChanged = !!email && email !== user.email;

		if (changes.password || emailChanged) {
			const isMatch = !!currentPassword && await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) {
				incorrectCurrentPassword();
				return null;
			}
		}

		// the new email only replaces the current one once its owner validates it
		if (emailChanged) {
			const pending = await this.userRepository.requestEmailChange(id, email);
			if (pending?.pendingEmail) {
				await this.emailValidationService.sendValidationLink({
					email: pending.pendingEmail,
					emailVerificationToken: pending.emailVerificationToken,
				});
			}
		}

		return await this.userRepository.update(id, changes);
	}

	async delete(id: User['id']): Promise<User | undefined> {
		return await this.userRepository.remove(id);
	}

	private async linkCart(identifiers: Required<ICartIdentifier>): Promise<Cart | null> {
		return await this.cartService.mergeGuestCartWithUserCart(identifiers);
	}
}