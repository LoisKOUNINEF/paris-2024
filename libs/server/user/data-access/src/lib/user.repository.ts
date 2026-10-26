import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { RoleValue } from '@paris-2024/shared-interfaces';
import {
  createAdminIsForbidden,
  userAlreadyExists,
  userNotFound,
} from './user.exceptions';
import { createToken } from '@paris-2024/server-utils';

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
      newUser.emailVerificationToken = createToken();
      
      await this.userRepository.save(newUser);

      return newUser;
    };

    if (userExists && userExists.deletedAt !== null) {
      return this.restore(userExists, createUserDto);
    };

    userAlreadyExists();
    return null;
  }

  async verifyEmail(token: string): Promise<{ user: User, isEmailChange: boolean } | null> {
    const user = await this.userRepository.findOne({
      where: {
        emailVerificationToken: token
      }
    });
    if (!user) {
      userNotFound();
      return null;
    }

    if (user.pendingEmail) {
      // the address may have been taken since the change was requested
      if (await this.findOneByEmail(user.pendingEmail)) {
        userAlreadyExists();
        return null;
      }

      await this.userRepository.save(Object.assign(user, {
        email: user.pendingEmail,
        pendingEmail: null,
        emailVerificationToken: null,
      }));
      return { user, isEmailChange: true };
    }

    await this.userRepository.save(Object.assign(user, {emailVerified: true, emailVerificationToken: null}))
    return { user, isEmailChange: false };
  }

  async requestEmailChange(id: User['id'], email: User['email']): Promise<User | null> {
    const user = await this.findOneById(id);

    if (!user) {
      userNotFound();
      return null;
    }

    if (await this.findOneByEmail(email)) {
      userAlreadyExists();
      return null;
    }

    return await this.userRepository.save(Object.assign(user, {
      pendingEmail: email,
      emailVerificationToken: createToken(),
    }));
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
      { lastLoginAt: new Date(), inactivityReminderSentAt: null }
    ));
  }

  private async restore(user: User, dto: CreateUserDto): Promise<User | null> {
    await this.userRepository.restore(user.id);

    const restored = await this.userRepository.findOne({
      where: { id: user.id },
      withDeleted: false,
    });
    if (!restored) return null;

    restored.firstName = dto.firstName;
    restored.lastName = dto.lastName;
    restored.password = dto.password;
    if (dto.role) {
      restored.role = dto.role;
    }

    // whoever signs up again must prove they own the inbox before using the account
    restored.emailVerified = false;
    restored.emailVerificationToken = createToken();
    restored.pendingEmail = null;

    restored.lastLoginAt = new Date();
    restored.anonymizationReminderSentAt = null;
    restored.inactivityReminderSentAt = null;

    return this.userRepository.save(restored);
  }
}