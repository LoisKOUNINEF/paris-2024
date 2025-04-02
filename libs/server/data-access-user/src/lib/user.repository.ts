import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { Roles, RoleValue } from '@paris-2024/shared-interfaces';
import {
  createAdminIsForbidden,
  userAlreadyExists,
  userNotFound,
} from './user.exceptions';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findUsers(): Promise<Array<User>> {
    return await this.userRepository.find({ where: { deletedAt: undefined } });
  }

  async findByRole(role: RoleValue): Promise<Array<User>> {
    return await this.userRepository
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.role = :role', { role: role })
      .getMany();
  }

  async findOneById(id: User['id']): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      userNotFound();
      return;
    };
    return user;
  }

  async findOneByEmail(email: User['email']): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User | undefined> {
    if (createUserDto.role === 'admin') {
      createAdminIsForbidden();
    };

    const userExists = await this.findOneByEmail(createUserDto.email);

    if (!userExists) {
      const newUser = this.userRepository.create(createUserDto);
      
      await this.userRepository.save(newUser);

      return newUser;
    };

    if(userExists && createUserDto.role === Roles.STAFF) {
      this.update(userExists.id, createUserDto);
    }

    if (userExists.deletedAt !== null) {
      return this.restore(userExists, createUserDto);
    };

    userAlreadyExists();
    return;
  }

  async update(id: User['id'], updateUserDto: UpdateUserDto): Promise<User | undefined> {
    const user = await this.findOneById(id);

    if (!user) {
      userNotFound();
      return;
    }

    await this.userRepository.save(Object.assign(user, updateUserDto));
    return user;
  }

  async remove(id: User['id']): Promise<User | undefined> {
    const user = await this.findOneById(id);

    if (!user) {
      userNotFound();
      return;
    }

    return await this.userRepository.softRemove(user);
  }

  async updateLastLogin(id: User['id']) {
    const user = await this.findOneById(id);

    if (!user) {
      userNotFound();
      return;
    }
    
    return await this.userRepository.save(Object.assign(user, { lastLoginDate: new Date() }))
  }

  private async restore(user: User, userDto: UpdateUserDto): Promise<User> {
    return await this.userRepository.save(
      Object.assign(user, {
        deletedAt: null,
        ...userDto,
      }),
    );
  }
}
