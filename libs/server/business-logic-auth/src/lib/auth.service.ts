import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@paris-2024/server-data-access-user';
import { IUser } from '@paris-2024/shared-interfaces';
import { incorrectPassword, userDoesntExist } from './auth.exceptions';

@Injectable()
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async validateUser(email: string, password: string): Promise<Partial<IUser> | null> {
    const user = await this.userRepository.findOneByEmail(email);
    
    if(!user) {
      userDoesntExist();
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      incorrectPassword()
      return null;
    }

    if (user && isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, createdAt, updatedAt, deletedAt, secretKey, ...rest } =
        user;
      this.userRepository.updateLastLogin(user.id);
      return rest;
    }

    return null;
  }
}
