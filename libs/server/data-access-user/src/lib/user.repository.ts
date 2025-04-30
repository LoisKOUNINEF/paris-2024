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

  async getUserWithSecret(userId: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'email', 'secretKey']
    });
    
    if (!user) {
      userNotFound();
      return;
    }

    return user;
  }

  async findOneByEmail(email: User['email']): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email },
      withDeleted: true,
    });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User | null> {
    if (createUserDto.role === 'admin') {
      createAdminIsForbidden();
    };

    const userExists = await this.findOneByEmail(createUserDto.email);

    if (!userExists) {
      const newUser = this.userRepository.create(createUserDto);
      newUser.lastLoginAt = new Date();
      
      await this.userRepository.save(newUser);

      return newUser;
    };

    if (userExists && userExists.deletedAt !== null) {
      return this.restore(userExists, createUserDto);
    };

    if(userExists && createUserDto.role === Roles.STAFF) {
      return this.update(userExists.id, createUserDto);
    };

    userAlreadyExists();
    return null;
  }

  async update(id: User['id'], updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findOneById(id);

    if (!user) {
      userNotFound();
      return null;
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
    
    return await this.userRepository.save(Object.assign(
      user, 
      { lastLoginAt: new Date() }
    ));
  }

  private async restore(user: User, dto: CreateUserDto): Promise<User | null> {
    await this.userRepository.restore(user.id);

    const restored = await this.userRepository.findOne({
      where: { id: user.id },
      withDeleted: false,
    });
    if (!restored) return null;

    restored.password = dto.password;

    restored.lastLoginAt = new Date();

    return this.userRepository.save(restored);
  }
}