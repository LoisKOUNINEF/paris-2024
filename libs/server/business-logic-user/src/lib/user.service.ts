import { Injectable } from '@nestjs/common';
import { Roles, RoleValue } from '@paris-2024/shared-interfaces';
import { UserRepository, CreateUserDto, User } from '@paris-2024/server-data-access-user';
import { WelcomeMailerService } from '@paris-2024/server-business-logic-mailer';

@Injectable()
export class UserService {
	constructor( 
		private userRepository: UserRepository,
		private welcomeMailerService: WelcomeMailerService,
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

	async create(createUserDto: CreateUserDto, isAdmin: boolean): Promise<User | undefined> {
		const role = isAdmin ? Roles.STAFF : Roles.CUSTOMER;

		const cartId = this.linkCart();

		const dto = { 
			...createUserDto,
			role: role,
			cartId: cartId
		};

		const createdUser = await this.userRepository.create(dto);

		if (!createdUser) { return }

		await this.welcomeMailerService.sendWelcome(createdUser.email);
	
		return createdUser;
	}

	private linkCart(): string {
		// Fetch Cart here
		const cart = { id: 'cartId'};

		return cart.id;
	}
}